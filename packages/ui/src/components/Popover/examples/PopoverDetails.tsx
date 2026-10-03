import { Info } from 'lucide-react';
import { IconButton } from '../../Button';
import { Popover, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from '../Popover';

export default function PopoverDetails() {
  return (
    <Popover>
      <PopoverTrigger render={<IconButton icon={Info} label="About usage limits" variant="secondary" />} />
      <PopoverContent arrow className="w-72">
        <PopoverTitle className="pe-8">Usage limits</PopoverTitle>
        <PopoverDescription>
          Each project can run up to 20 deployments a day. Limits reset at midnight UTC and are shared by all members.
        </PopoverDescription>
        <PopoverClose />
      </PopoverContent>
    </Popover>
  );
}
