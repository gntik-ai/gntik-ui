import { withoutForcedColors } from './without-forced-colors';

describe('withoutForcedColors', () => {
  it('drops an all-forced class attribute but preserves empty and ordinary attributes exactly', () => {
    const element = document.createElement('div');
    element.innerHTML =
      '<i class="forced-colors:block\tforced-colors:bg-[Canvas]"></i><b class=""></b><span class=" \t "></span><em></em>';

    expect(withoutForcedColors(element).innerHTML).toBe('<i></i><b class=""></b><span class=" \t "></span><em></em>');
  });

  it('clones the whole DOM and removes only forced-colors class tokens', () => {
    const element = document.createElement('section');
    element.setAttribute('class', 'alpha\tforced-colors:bg-[Canvas]\n beta');
    element.setAttribute('data-state', 'checked');
    element.innerHTML =
      'Before<!--keep--><span class="first forced-colors:text-[HighlightText] hover:forced-colors:bg-[Canvas] last" aria-label="Choice">Text <b class="bold  unchanged">inside</b></span>After<svg class="icon forced-colors:fill-[CanvasText]"><path d="M0 0"></path></svg>';
    const original = element.outerHTML;

    const filtered = withoutForcedColors(element);

    expect(filtered.outerHTML).toBe(
      '<section class="alpha beta" data-state="checked">Before<!--keep--><span class="first hover:forced-colors:bg-[Canvas] last" aria-label="Choice">Text <b class="bold  unchanged">inside</b></span>After<svg class="icon"><path d="M0 0"></path></svg></section>',
    );
    expect(filtered).not.toBe(element);
    expect(filtered.firstElementChild).not.toBe(element.firstElementChild);
    expect(element.outerHTML).toBe(original);
  });

  it.each(['class', 'aria-label'])('retains a %s regression in a fixture copy', (attribute) => {
    const element = document.createElement('div');
    element.innerHTML = '<button class="ordinary forced-colors:bg-[Highlight]" aria-label="Save">Save</button>';
    const baseline = '<button class="ordinary" aria-label="Save">Save</button>';
    expect(withoutForcedColors(element).innerHTML).toBe(baseline);

    const changed = element.cloneNode(true) as HTMLElement;
    changed.firstElementChild!.setAttribute(attribute, 'changed');

    expect(withoutForcedColors(changed).innerHTML).not.toBe(baseline);
    expect(element.innerHTML).toBe(
      '<button class="ordinary forced-colors:bg-[Highlight]" aria-label="Save">Save</button>',
    );
  });
});
