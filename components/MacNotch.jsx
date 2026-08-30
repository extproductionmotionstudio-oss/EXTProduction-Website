export default function MacNotch({ style = {}, className = "" }) {
  return (
    <div className={`mac-notch-corner ${className}`} style={style} aria-hidden="true">
      <span className="mac-dot mac-red" title="Close"></span>
      <span className="mac-dot mac-yellow" title="Minimize"></span>
      <span className="mac-dot mac-green" title="Zoom"></span>
    </div>
  );
}
