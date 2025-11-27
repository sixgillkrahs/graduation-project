import { useDeleteResource } from "../services/mutation";
import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { memo } from "react";

const ModalConfirm = ({
  isOpen,
  onOpenChange,
  onClose,
  isSelectRecord,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenChange: (isOpen: boolean) => void;
  isSelectRecord: IResourceService.ResourceDTO;
}) => {
  const { mutate: deleteResource } = useDeleteResource();
  const onDelete = (id: string) => {
    deleteResource(id);
    onClose();
  };
  return (
    <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Delete Resource</ModalHeader>
            <ModalBody>
              <h1>Bạn có muốn xóa tài nguyên {isSelectRecord.name}?</h1>
            </ModalBody>
            <ModalFooter>
              <Button color="default" onPress={onClose}>
                Close
              </Button>
              <Button color="danger" onPress={() => onDelete(isSelectRecord.id)}>
                Delete
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default memo(ModalConfirm);
