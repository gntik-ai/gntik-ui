// 'use client';

import { BarChart, Card } from '@tremor/react';

const data = [
  {
    date: 'Jan 23',
    'This Year': 68560,
    'Last Year': 28560,
  },
  {
    date: 'Feb 23',
    'This Year': 70320,
    'Last Year': 30320,
  },
  {
    date: 'Mar 23',
    'This Year': 80233,
    'Last Year': 70233,
  },
  {
    date: 'Apr 23',
    'This Year': 55123,
    'Last Year': 45123,
  },
  {
    date: 'May 23',
    'This Year': 56000,
    'Last Year': 80600,
  },
  {
    date: 'Jun 23',
    'This Year': 100000,
    'Last Year': 85390,
  },
  {
    date: 'Jul 23',
    'This Year': 85390,
    'Last Year': 45340,
  },
  {
    date: 'Aug 23',
    'This Year': 80100,
    'Last Year': 70120,
  },
  {
    date: 'Sep 23',
    'This Year': 75090,
    'Last Year': 69450,
  },
  {
    date: 'Oct 23',
    'This Year': 71080,
    'Last Year': 63345,
  },
  {
    date: 'Nov 23',
    'This Year': 61210,
    'Last Year': 100330,
  },
  {
    date: 'Dec 23',
    'This Year': 60143,
    'Last Year': 45321,
  },
];

function valueFormatter(number) {
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    notation: 'compact',
    compactDisplay: 'short',
    style: 'currency',
    currency: 'USD',
  });
  return formatter.format(number);
}

export default function Example() {
  return (
    <>
      <Card className="sm:mx-auto sm:max-w-2xl">
        <h3 className="font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          Sales overview
        </h3>
        <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
        </p>
        <ul role="list" className="mt-6 flex gap-10">
          <li>
            <div className="flex items-center space-x-1.5">
              <span
                className="size-2.5 rounded-sm bg-tremor-brand dark:bg-dark-tremor-brand"
                aria-hidden={true}
              />
              <p className="text-tremor-label text-tremor-content dark:text-dark-tremor-content">
                This year
              </p>
            </div>
            <div className="flex items-center space-x-1.5">
              <p className="mt-0.5 text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                $0.8M
              </p>
              <span className="rounded-tremor-small bg-tremor-background-subtle px-1.5 py-0.5 text-tremor-label font-medium text-tremor-content dark:bg-dark-tremor-background-subtle dark:text-dark-tremor-content">
                +16%
              </span>
            </div>
          </li>
          <li>
            <div className="flex items-center space-x-1.5">
              <span
                className="size-2.5 rounded-sm bg-cyan-500"
                aria-hidden={true}
              />
              <p className="text-tremor-label text-tremor-content dark:text-dark-tremor-content">
                Last year
              </p>
            </div>
            <p className="mt-0.5 text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
              $0.7M
            </p>
          </li>
        </ul>
        <BarChart
          data={data}
          index="date"
          categories={['Last Year', 'This Year']}
          colors={['cyan', 'blue']}
          showLegend={false}
          valueFormatter={valueFormatter}
          yAxisWidth={50}
          className="mt-8 hidden h-56 sm:block"
        />
        <BarChart
          data={data}
          index="date"
          categories={['Last Year', 'This Year']}
          colors={['cyan', 'blue']}
          showLegend={false}
          valueFormatter={valueFormatter}
          showYAxis={false}
          className="mt-8 h-48 sm:hidden"
        />
      </Card>
    </>
  );
}
