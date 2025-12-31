import { EmailService } from "@/services/email.service";
import { EmailWorker } from "@/workers/email.worker";

const emailService = new EmailService();
new EmailWorker(emailService);
