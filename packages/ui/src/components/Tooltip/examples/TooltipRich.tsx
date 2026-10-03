import { Button } from '../../Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../Tooltip';

export default function TooltipRich() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button variant="secondary" />}>Seats: 18 of 20</TooltipTrigger>
        <TooltipContent variant="rich" side="right">
          <div className="text-[12.5px] font-semibold text-foreground">Seats almost full</div>
          <p className="mt-1 text-muted-foreground">Two seats left on this plan. Billing admins can add more from Settings.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
