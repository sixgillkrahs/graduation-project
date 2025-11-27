import { useCreateResource } from "../services/mutation";
import { useGetResource } from "../services/query";
import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Input, Textarea } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { memo, useState } from "react";

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mutate: createResource, isPending } = useCreateResource();
  const { data: resource } = useGetResource(isSelectRecord?.id || "");
  const [name, setName] = useState("");
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(new FormData(event.currentTarget));
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
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
                validationErrors={errors}
                onSubmit={onSubmit}
                id="resource-form"
              >
                <Input
                  label="Resource Name"
                  name="name"
                  type="text"
                  labelPlacement="outside-top"
                  size="sm"
                  errorMessage={errors.name}
                  isRequired={true}
                  value={name}
                  onValueChange={setName}
                />
                <Textarea
                  label="Description"
                  name="description"
                  labelPlacement="outside"
                  description="Max 100 characters"
                  type="text"
                  size="sm"
                  errorMessage={errors.description}
                  maxLength={100}
                />
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="default" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" type="submit" form="resource-form" isLoading={isPending}>
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
