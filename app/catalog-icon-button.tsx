type Props = {
  label: string;
  icon: 'edit' | 'remove';
  onClick: () => void;
};

export default function CatalogIconButton({label, icon, onClick}: Props) {
  return <button type="button" className={(icon === 'edit' ? 'secondary' : 'delete-trigger') + ' action-icon'}
    title={label} aria-label={label} onClick={onClick}>
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d={icon === 'edit' ? 'm15 5 4 4M4 20l4-1 12-12a2.8 2.8 0 0 0-4-4L4 15z' :
        'M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7'}/>
    </svg>
  </button>;
}
