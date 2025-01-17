import { HitsTemplates } from '../../src/widgets/hits/hits';
import { Playground } from '../decorators';

export const hitsItemTemplate: HitsTemplates['item'] = (
  hit,
  { html, components }
) => html`
  <div class="hits-image" style="background-image: url(${hit.image})"></div>
  <article>
    <header>
      <strong>${components.Highlight({ hit, attribute: 'name' })}</strong>
    </header>
    <p>${components.Snippet({ hit, attribute: 'description' })}</p>
    <footer>
      <p>
        <strong>${hit.price}$</strong>
      </p>
    </footer>
  </article>
`;

const instantSearchPlayground: Playground = function instantSearchPlayground({
  search,
  instantsearch,
  leftPanel,
  rightPanel,
}) {
  const refinementList = document.createElement('div');
  leftPanel.appendChild(refinementList);

  const brandList = instantsearch.widgets.panel<
    typeof instantsearch.widgets.refinementList
  >({
    templates: {
      header: () => 'Brands',
    },
  })(instantsearch.widgets.refinementList);

  search.addWidgets([
    brandList({
      container: refinementList,
      attribute: 'brand',
    }),
  ]);

  const numericMenuContainer = document.createElement('div');
  leftPanel.appendChild(numericMenuContainer);

  const priceMenu = instantsearch.widgets.panel<
    typeof instantsearch.widgets.numericMenu
  >({ templates: { header: () => 'Price' } })(
    instantsearch.widgets.numericMenu
  );

  search.addWidgets([
    priceMenu({
      container: numericMenuContainer,
      attribute: 'price',
      items: [
        { label: 'All' },
        { label: '≤ 10$', end: 10 },
        { label: '10–100$', start: 10, end: 100 },
        { label: '100–500$', start: 100, end: 500 },
        { label: '≥ 500$', start: 500 },
      ],
    }),
  ]);

  const ratingMenu = document.createElement('div');
  leftPanel.appendChild(ratingMenu);

  const ratingList = instantsearch.widgets.panel<
    typeof instantsearch.widgets.ratingMenu
  >({
    templates: {
      header: () => 'Rating',
    },
  })(instantsearch.widgets.ratingMenu);

  search.addWidgets([
    ratingList({
      container: ratingMenu,
      attribute: 'rating',
    }),
  ]);

  const searchBox = document.createElement('div');
  searchBox.classList.add('searchbox');
  rightPanel.appendChild(searchBox);

  search.addWidgets([
    instantsearch.widgets.searchBox({
      container: searchBox,
      placeholder: 'Search here…',
    }),
  ]);

  const stats = document.createElement('div');
  stats.classList.add('stats');
  rightPanel.appendChild(stats);

  search.addWidgets([
    instantsearch.widgets.stats({
      container: stats,
    }),
  ]);

  const hitsElement = document.createElement('div');
  hitsElement.classList.add('hits');
  rightPanel.appendChild(hitsElement);

  search.addWidgets([
    instantsearch.widgets.hits({
      container: hitsElement,
      templates: {
        item: hitsItemTemplate,
      },
      cssClasses: {
        item: 'hits-item',
      },
    }),
  ]);

  const pagination = document.createElement('div');
  rightPanel.appendChild(pagination);

  search.addWidgets([
    instantsearch.widgets.pagination({
      container: pagination,
    }),
    instantsearch.widgets.hitsPerPage({
      container: rightPanel.appendChild(document.createElement('div')),
      items: [
        { label: '16 per page', value: 16 },
        { label: '32 per page', value: 32 },
        { label: '64 per page', value: 64, default: true },
      ],
    }),
  ]);

  const insights = instantsearch.middlewares.createInsightsMiddleware({
    insightsClient: null,
    onEvent: props => {
      console.log('insights onEvent', props);
    },
  });
  search.use(insights);
};

export default instantSearchPlayground;
