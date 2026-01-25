const RenderField = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="grid gap-1">
      <span className="cs-paragraph-gray text-[14px]! font-bold! uppercase">
        {label}
      </span>
      <span className="cs-paragraph text-[16px]! font-bold!">{value}</span>
    </div>
  );
};

export default RenderField;
