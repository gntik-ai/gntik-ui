import { Download } from 'lucide-react';
import { VisuallyHidden } from '../VisuallyHidden';

export default function VisuallyHiddenLabel() {
  return (
    <table className="w-full max-w-[420px] text-[13px]">
      <thead>
        <tr className="border-b border-border text-left text-muted-foreground">
          <th className="py-2 font-medium">Invoice</th>
          <th className="py-2 font-medium">Amount</th>
          <th className="py-2"><VisuallyHidden>Actions</VisuallyHidden></th>
        </tr>
      </thead>
      <tbody>
        <tr className="text-foreground">
          <td className="py-2 font-mono">INV-0042</td>
          <td className="py-2">€1,240.00</td>
          <td className="py-2 text-right">
            <a href="#invoice-0042" className="inline-flex text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring">
              <Download size={14} aria-hidden />
              <VisuallyHidden>Download INV-0042</VisuallyHidden>
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
