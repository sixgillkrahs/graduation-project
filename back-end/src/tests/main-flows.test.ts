const assert = require("node:assert/strict");
const { test } = require("node:test");

const redisModulePath = require.resolve("../config/redis.connection.ts");

require.cache[redisModulePath] = {
  id: redisModulePath,
  filename: redisModulePath,
  loaded: true,
  exports: {
    redisConnection: {
      get: async () => null,
      set: async () => "OK",
    },
  },
} as NodeJS.Module;

const { ChatController } = require("../controllers/chat.controller.ts");
const { ScheduleController } = require("../controllers/schedule.controller.ts");
const { LeadController } = require("../controllers/lead.controller.ts");
const { PropertyController } = require("../controllers/property.controller.ts");
const { InteractionType } = require("../models/property-interaction.model.ts");
const {
  LeadContactChannelEnum,
  LeadContactTimeEnum,
  LeadIntentEnum,
  LeadSourceEnum,
  LeadStatusEnum,
} = require("../models/lead.model.ts");

const flushPromises = () =>
  new Promise((resolve) => {
    setImmediate(resolve);
  });

const createResponse = () => {
  const state = {
    statusCode: 200,
    body: undefined as any,
  };

  const res = {
    status(code: number) {
      state.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      state.body = payload;
      return this;
    },
  };

  return { res, state };
};

const createNext = () => {
  const calls: unknown[] = [];
  const next = (error?: unknown) => {
    if (typeof error !== "undefined") {
      calls.push(error);
    }
  };

  return { next, calls };
};

const createUser = (id: string, roleCode = "USER") => ({
  userId: {
    _id: {
      toString: () => id,
    },
  },
  roleId: {
    code: roleCode,
  },
});

const invokeController = async (handler: Function, req: Record<string, any>) => {
  const { res, state } = createResponse();
  const { next, calls } = createNext();

  await handler(req, res, next);
  await flushPromises();

  return {
    statusCode: state.statusCode,
    body: state.body,
    nextCalls: calls,
  };
};

test("creates a conversation with the current user and participants", async () => {
  const calls: Array<{ currentUserId: string; participantIds: string[] }> = [];
  const controller = new ChatController({
    createConversation: async (currentUserId: string, participantIds: string[]) => {
      calls.push({ currentUserId, participantIds });
      return {
        id: "conversation-1",
        participants: [currentUserId, ...participantIds],
      };
    },
  } as any);

  const result = await invokeController(controller.createConversation, {
    body: {
      participantIds: ["agent-123"],
    },
    user: createUser("buyer-456"),
  });

  assert.equal(result.statusCode, 200);
  assert.deepEqual(result.nextCalls, []);
  assert.deepEqual(calls, [
    {
      currentUserId: "buyer-456",
      participantIds: ["agent-123"],
    },
  ]);
  assert.equal(result.body.success, true);
  assert.equal(result.body.data.id, "conversation-1");
});

test("requests a viewing schedule and notifies the assigned agent", async () => {
  const createdSchedules: any[] = [];
  const notifications: any[] = [];

  const controller = new ScheduleController(
    {
      addMinutesToTime: (startTime: string, minutes: number) => {
        assert.equal(startTime, "09:00");
        assert.equal(minutes, 60);
        return "10:00";
      },
      createSchedule: async (payload: any) => {
        createdSchedules.push(payload);
        return payload;
      },
    } as any,
    {} as any,
    {
      getPropertyById: async (listingId: string) => {
        assert.equal(listingId, "listing-1");
        return {
          _id: "listing-1",
          title: "Sunset Apartment",
          userId: {
            _id: "agent-22",
          },
          location: {
            address: "12 Nguyen Hue",
          },
        };
      },
    } as any,
    {} as any,
    {
      enqueueNotification: (payload: any) => {
        notifications.push(payload);
        return payload;
      },
    } as any,
    {} as any,
  );

  const result = await invokeController(controller.requestSchedule, {
    body: {
      listingId: "listing-1",
      customerName: "Buyer One",
      customerPhone: "0900000001",
      customerEmail: "buyer@example.com",
      date: "2026-03-20",
      startTime: "09:00",
      customerNote: "Please confirm parking access.",
    },
    user: createUser("buyer-1"),
  });

  assert.equal(result.statusCode, 200);
  assert.deepEqual(result.nextCalls, []);
  assert.equal(result.body.data, "Booking requested successfully");
  assert.equal(createdSchedules.length, 1);
  assert.equal(createdSchedules[0].agentId, "agent-22");
  assert.equal(String(createdSchedules[0].userId), "buyer-1");
  assert.equal(createdSchedules[0].listingId, "listing-1");
  assert.equal(createdSchedules[0].customerName, "Buyer One");
  assert.equal(createdSchedules[0].customerPhone, "0900000001");
  assert.equal(createdSchedules[0].customerEmail, "buyer@example.com");
  assert.equal(createdSchedules[0].title, "Yeu cau dat lich xem nha");
  assert.equal(createdSchedules[0].date, "2026-03-20");
  assert.equal(createdSchedules[0].startTime, "09:00");
  assert.equal(createdSchedules[0].endTime, "10:00");
  assert.equal(createdSchedules[0].location, "12 Nguyen Hue");
  assert.equal(createdSchedules[0].type, "VIEWING");
  assert.equal(createdSchedules[0].status, "PENDING");
  assert.equal(
    createdSchedules[0].customerNote,
    "Please confirm parking access.",
  );
  assert.equal(createdSchedules[0].agentNote, "");
  assert.equal(createdSchedules[0].color, "#10b981");
  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].userId, "agent-22");
  assert.equal(notifications[0].metadata.endTime, "10:00");
  assert.equal(notifications[0].metadata.propertyTitle, "Sunset Apartment");
});

test("records favorite and unfavorite interactions for a property", async (t: any) => {
  for (const action of ["SAVE", "UNSAVE"]) {
    await t.test(`passes ${action} metadata through to the interaction store`, async () => {
      const calls: any[] = [];
      const controller = new PropertyController(
        {
          recordInteraction: async (...args: any[]) => {
            calls.push(args);
            return {
              id: `interaction-${action.toLowerCase()}`,
              metadata: args[3],
            };
          },
        } as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
      );

      const result = await invokeController(controller.recordInteraction, {
        params: {
          id: "listing-9",
        },
        body: {
          type: InteractionType.FAVORITE,
          metadata: {
            action,
            source: "PROPERTY_DETAIL",
          },
        },
        user: createUser("buyer-99"),
      });

      assert.equal(result.statusCode, 200);
      assert.deepEqual(result.nextCalls, []);
      assert.equal(calls.length, 1);
      assert.deepEqual(calls[0], [
        "listing-9",
        InteractionType.FAVORITE,
        "buyer-99",
        {
          action,
          source: "PROPERTY_DETAIL",
        },
      ]);
      assert.equal(result.body.data.metadata.action, action);
    });
  }
});

test("fetches property detail and derives favorite state from the latest interaction", async () => {
  const controller = new PropertyController(
    {
      getPropertyById: async (id: string, populate: string) => {
        assert.equal(id, "listing-7");
        assert.equal(populate, "userId");
        return {
          _id: "listing-7",
          title: "Riverfront Condo",
          userId: {
            _id: "agent-7",
          },
        };
      },
    } as any,
    {} as any,
    {
      getInteractions: async (
        propertyId: string,
        type: string,
        userId: string,
      ) => {
        assert.equal(propertyId, "listing-7");
        assert.equal(type, InteractionType.FAVORITE);
        assert.equal(userId, "buyer-7");

        return [
          {
            metadata: {
              action: "SAVE",
            },
          },
        ];
      },
    } as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
  );

  (controller as any).enrichPropertiesWithAgentPlan = async (properties: any[]) =>
    properties.map((property) => ({
      ...property,
      agentPlan: "FREE",
    }));

  const result = await invokeController(controller.getPropertyForLandingPage, {
    params: {
      id: "listing-7",
    },
    lang: "en",
    user: createUser("buyer-7"),
  });

  assert.equal(result.statusCode, 200);
  assert.deepEqual(result.nextCalls, []);
  assert.equal(result.body.data._id, "listing-7");
  assert.equal(result.body.data.isFavorite, true);
  assert.equal(result.body.data.agentPlan, "FREE");
});

test("submits an inquiry lead and tracks it back into CRM metadata", async () => {
  const leadCalls: any[] = [];
  const interactionCalls: any[] = [];
  const notificationCalls: any[] = [];
  const noticeCalls: any[] = [];

  const controller = new LeadController(
    {
      createOrRefreshLead: async (payload: any) => {
        leadCalls.push(payload);
        return {
          lead: {
            _id: "lead-1",
            status: LeadStatusEnum.NEW,
          },
          isDuplicate: false,
        };
      },
    } as any,
    {
      getPropertyById: async (listingId: string, populate: string) => {
        assert.equal(listingId, "listing-55");
        assert.equal(populate, "userId");

        return {
          _id: "listing-55",
          title: "Garden House",
          userId: {
            _id: "agent-55",
          },
        };
      },
      recordInteraction: async (...args: any[]) => {
        interactionCalls.push(args);
        return true;
      },
    } as any,
    {
      enqueueNotification: (payload: any) => {
        notificationCalls.push(payload);
        return payload;
      },
    } as any,
    {
      createNotice: async (payload: any) => {
        noticeCalls.push(payload);
        return payload;
      },
    } as any,
  );

  const result = await invokeController(controller.createLead, {
    body: {
      listingId: "listing-55",
      customerName: "Buyer Inquiry",
      customerPhone: "0911222333",
      customerEmail: "buyer@crm.test",
      intent: LeadIntentEnum.CONSULTATION,
      interestTopics: ["PRICE", "VIEWING"],
      budgetRange: "FLEXIBLE",
      preferredContactTime: LeadContactTimeEnum.NEXT_24_HOURS,
      preferredContactChannel: LeadContactChannelEnum.CHAT,
      message: "Need more detail about legal docs.",
    },
    user: createUser("buyer-55"),
    ip: "127.0.0.1",
    socket: {
      remoteAddress: "127.0.0.1",
    },
    get: (header: string) =>
      header === "User-Agent" ? "node-test-agent" : undefined,
  });

  assert.equal(result.statusCode, 200);
  assert.deepEqual(result.nextCalls, []);
  assert.equal(result.body.data.leadId, "lead-1");
  assert.equal(result.body.data.status, LeadStatusEnum.NEW);
  assert.equal(result.body.data.isDuplicate, false);

  assert.equal(leadCalls.length, 1);
  assert.equal(leadCalls[0].agentId, "agent-55");
  assert.equal(leadCalls[0].listingId, "listing-55");
  assert.equal(leadCalls[0].source, LeadSourceEnum.PROPERTY_REQUEST);
  assert.deepEqual(leadCalls[0].metadata, {
    ipAddress: "127.0.0.1",
    userAgent: "node-test-agent",
  });

  assert.deepEqual(interactionCalls[0], [
    "listing-55",
    InteractionType.CONTACT_FORM,
    "buyer-55",
    {
      source: LeadSourceEnum.PROPERTY_REQUEST,
      intent: LeadIntentEnum.CONSULTATION,
      preferredContactTime: LeadContactTimeEnum.NEXT_24_HOURS,
      preferredContactChannel: LeadContactChannelEnum.CHAT,
      duplicate: false,
    },
  ]);

  assert.equal(notificationCalls.length, 1);
  assert.equal(notificationCalls[0].userId, "agent-55");
  assert.equal(notificationCalls[0].metadata.leadId, "lead-1");
  assert.equal(notificationCalls[0].metadata.source, LeadSourceEnum.PROPERTY_REQUEST);

  assert.equal(noticeCalls.length, 1);
  assert.equal(noticeCalls[0].userId, "agent-55");
  assert.equal(noticeCalls[0].metadata.status, LeadStatusEnum.NEW);
});
