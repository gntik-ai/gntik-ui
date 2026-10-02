import { Select, SelectContent, SelectGroup, SelectGroupLabel, SelectItem, SelectLabel, SelectSeparator, SelectTrigger } from '../Select';

const sizes = {
  small: 'Small · 1 vCPU',
  medium: 'Medium · 2 vCPU',
  large: 'Large · 4 vCPU',
  'gpu-a': 'GPU · 1× accelerator',
  'gpu-b': 'GPU · 4× accelerators',
};

export default function SelectGrouped() {
  return (
    <div className="w-full max-w-sm">
      <Select items={sizes}>
        <SelectLabel>Instance size</SelectLabel>
        <SelectTrigger placeholder="Choose a size…" />
        <SelectContent>
          <SelectGroup>
            <SelectGroupLabel>General purpose</SelectGroupLabel>
            <SelectItem value="small">{sizes.small}</SelectItem>
            <SelectItem value="medium">{sizes.medium}</SelectItem>
            <SelectItem value="large">{sizes.large}</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectGroupLabel>Accelerated</SelectGroupLabel>
            <SelectItem value="gpu-a">{sizes['gpu-a']}</SelectItem>
            <SelectItem value="gpu-b">{sizes['gpu-b']}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
