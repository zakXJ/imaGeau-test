import clsx from 'clsx';

type TabProps = {
    title: string;
    enable: boolean;
    onClick: () => void;
}

export default function Tab({ title, enable, onClick }: TabProps) {
  return (
    <div className={clsx('px-2 pb-3 pt-1 cursor-pointer ', { 'border-b-4 border-indigo-400 text-black': enable }, { 'text-gray-500 hover:text-black': !enable })} onClick={onClick}>
          { title }
    </div>
  )
}
