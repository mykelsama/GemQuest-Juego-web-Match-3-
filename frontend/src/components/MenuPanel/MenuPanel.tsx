import "../../styles/menuPanel.css";

type MenuPanelProps = {
  children: React.ReactNode;
  className?: string;
};

/** Contenedor visual de menu con marco metalico y remaches decorativos. */
export default function MenuPanel({ children, className = "" }: MenuPanelProps) {
  return (
    <div className={`menuPanel ${className}`.trim()}>
      <span className="menuPanelRivet menuPanelRivet--tl" aria-hidden />
      <span className="menuPanelRivet menuPanelRivet--tr" aria-hidden />
      <span className="menuPanelRivet menuPanelRivet--bl" aria-hidden />
      <span className="menuPanelRivet menuPanelRivet--br" aria-hidden />
      {children}
    </div>
  );
}
