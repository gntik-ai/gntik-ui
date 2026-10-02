import { Slider } from '../Slider';

export default function SliderRange() {
  return (
    <div className="grid w-full max-w-sm gap-7">
      <Slider
        label="Autoscaling bounds"
        showValue
        min={1}
        max={20}
        defaultValue={[2, 8]}
        minStepsBetweenValues={1}
        thumbLabels={['Minimum instances', 'Maximum instances']}
      />
      <Slider
        label="Monthly budget"
        showValue
        min={0}
        max={5000}
        step={100}
        largeStep={500}
        defaultValue={[500, 2000]}
        format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
        thumbLabels={['Minimum budget', 'Maximum budget']}
      />
    </div>
  );
}
