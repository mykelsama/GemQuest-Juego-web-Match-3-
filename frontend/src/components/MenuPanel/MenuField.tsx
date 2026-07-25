import { gemImages } from "../../assets/images/gems";

type GemIcon = keyof typeof gemImages;

type MenuFieldProps = {
  label: string;
  icon: GemIcon;
  children: React.ReactNode;
};

/** Campo de formulario con etiqueta y icono de gema a la izquierda. */
export default function MenuField({ label, icon, children }: MenuFieldProps) {
  return (
    <label className="menuField">
      <span className="menuFieldLabel">{label}</span>
      <div className="menuFieldControl">
        <img src={gemImages[icon]} alt="" className="menuFieldIcon" />
        {children}
      </div>
    </label>
  );
}
