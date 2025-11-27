import { useCreateResource, useUpdateResource } from "../services/mutation";
import { useGetResource } from "../services/query";
import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Input, Textarea } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { memo, useEffect, type BaseSyntheticEvent } from "react";
import { Controller, useForm } from "react-hook-form";

const ModalCU = ({
  isOpen,
  onOpenChange,
  onClose,
  isSelectRecord,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onClose: () => void;
  isSelectRecord?: IResourceService.ResourceDTO;
}) => {
  const { mutate: createResource, isPending: isCreatePending } = useCreateResource();
  const { mutate: updateResource, isPending: isUpdatePending } = useUpdateResource();
  const { data: resource } = useGetResource(isSelectRecord?.id || "");
  const { handleSubmit, control, reset } = useForm<IResourceService.CreateResourceDTO>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (resource?.data) {
        reset({
          name: resource?.data?.name || "",
          description: resource?.data?.description || "",
        });
      } else {
        reset({
          name: "",
          description: "",
        });
      }
    }
  }, [isOpen, resource, reset]);

  const onSubmit = (data: IResourceService.CreateResourceDTO, event: BaseSyntheticEvent) => {
    event.preventDefault();
    if (isSelectRecord?.id) {
      updateResource(
        {
          id: isSelectRecord.id,
          description: data.description,
          name: data.name,
        },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    } else {
      createResource(
        {
          description: data.description,
          name: data.name,
        },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    }
  };

  return (
    <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Create Resource</ModalHeader>
            <ModalBody>
              <Form
                className="gap-3!"
                onSubmit={handleSubmit((data, event) => onSubmit(data, event!))}
                id="resource-form"
              >
                <Controller
                  name="name"
                  control={control}
                  render={({
                    field: { name, value, onChange, onBlur, ref },
                    fieldState: { invalid, error },
                  }) => (
                    <Input
                      ref={ref}
                      isRequired
                      errorMessage={error?.message}
                      validationBehavior="aria"
                      isInvalid={invalid}
                      label="Resource Name"
                      name={name}
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                      type="text"
                      labelPlacement="outside-top"
                      size="sm"
                    />
                  )}
                  rules={{
                    required: "Resource name is required",
                    maxLength: {
                      value: 100,
                      message: "Resource name must be at most 100 characters",
                    },
                  }}
                />
                <Controller
                  name="description"
                  control={control}
                  render={({
                    field: { name, value, onChange, onBlur, ref },
                    fieldState: { invalid, error },
                  }) => (
                    <Textarea
                      ref={ref}
                      isRequired
                      errorMessage={error?.message}
                      validationBehavior="aria"
                      isInvalid={invalid}
                      label="Description"
                      name={name}
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                      type="text"
                      labelPlacement="outside-top"
                      size="sm"
                    />
                  )}
                  rules={{
                    maxLength: {
                      value: 100,
                      message: "Description must be at most 100 characters",
                    },
                  }}
                />
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="default" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                type="submit"
                form="resource-form"
                isLoading={isCreatePending || isUpdatePending}
              >
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default memo(ModalCU);
