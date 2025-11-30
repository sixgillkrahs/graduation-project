import type { MessageInstance } from 'antd/es/message/interface';

class MessageService {
    private static instance: MessageService;
    private messageApi: MessageInstance | null = null;

    private constructor() { }

    static getInstance() {
        if (!MessageService.instance) {
            MessageService.instance = new MessageService();
        }
        return MessageService.instance;
    }

    init(messageApi: MessageInstance) {
        this.messageApi = messageApi;
    }

    success(content: string) {
        this.messageApi?.success(content);
    }

    error(content: string) {
        this.messageApi?.error(content);
    }

    info(content: string) {
        this.messageApi?.info(content);
    }

    warning(content: string) {
        this.messageApi?.warning(content);
    }

    loading(content: string) {
        this.messageApi?.loading(content);
    }
}

export default MessageService.getInstance();