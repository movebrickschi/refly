import { memo, useEffect, useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { logEvent } from '@refly/telemetry-web';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { MarketplaceErrorBoundary } from './error-boundary';
import { SettingItem } from '@refly-packages/ai-workspace-common/components/canvas/front-page';
import { useListCanvasTemplateCategories } from '@refly-packages/ai-workspace-common/queries/queries';
import { TemplateCardSkeleton } from '@refly-packages/ai-workspace-common/components/canvas-template/template-card-skeleton';
import cn from 'classnames';

// Lazy load TemplateList to reduce initial bundle size
const TemplateList = lazy(() =>
  import('@refly-packages/ai-workspace-common/components/canvas-template/template-list').then(
    (m) => ({ default: m.TemplateList }),
  ),
);

// Sentinel value for "all templates" (no category filter)
const ALL_CATEGORY = '__all__';

const MarketplacePageContent = memo(() => {
  const { t, i18n } = useTranslation();
  const currentLanguage = (i18n.languages?.[0] || i18n.language || 'en') as string;

  // Always start with ALL_CATEGORY so TemplateList renders immediately
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_CATEGORY);

  useEffect(() => {
    logEvent('enter_marketplace');
  }, []);

  // Fetch template categories (optional — page works even if this fails)
  const { data, isLoading: isLoadingCategories } = useListCanvasTemplateCategories({});

  const templateCategories = useMemo(() => {
    const categories = data?.data ?? [];
    if (categories.length === 0) return [];
    // Sort: Featured first, then original order
    return [...categories].sort((a, b) => {
      const priorityNames = ['featured', 'popular', 'hot'];
      const getLabel = (c: typeof a) =>
        (c.labelDict?.en ?? c.labelDict?.['en-US'] ?? c.name ?? '').toLowerCase();
      const aLabel = getLabel(a);
      const bLabel = getLabel(b);
      const indexA = priorityNames.findIndex((name) => aLabel.includes(name));
      const indexB = priorityNames.findIndex((name) => bLabel.includes(name));
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });
  }, [data?.data]);

  // Auto-select first real category once loaded (if user hasn't picked one yet)
  useEffect(() => {
    if (isLoadingCategories || templateCategories.length === 0) return;
    // If still on ALL_CATEGORY, switch to "Featured" or first category
    if (selectedCategoryId === ALL_CATEGORY) {
      const featured = templateCategories.find((c) => {
        const label = (c.labelDict?.en ?? c.labelDict?.['en-US'] ?? c.name ?? '').toLowerCase();
        return label === 'featured';
      });
      const defaultId = featured?.categoryId || templateCategories[0]?.categoryId;
      if (defaultId) {
        setSelectedCategoryId(defaultId);
      }
    }
  }, [templateCategories, isLoadingCategories, selectedCategoryId]);

  const handleCategoryClick = useCallback(
    (categoryId: string) => {
      if (categoryId !== selectedCategoryId) {
        setSelectedCategoryId(categoryId);
      }
    },
    [selectedCategoryId],
  );

  // The actual categoryId to pass to TemplateList:
  // ALL_CATEGORY → '' (no filter), otherwise the real categoryId
  const effectiveCategoryId = selectedCategoryId === ALL_CATEGORY ? '' : selectedCategoryId;

  const skeletonGrid = (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <TemplateCardSkeleton key={index} />
      ))}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{t('loggedHomePage.siderMenu.marketplace')}</title>
      </Helmet>
      <div className="w-full h-full flex flex-col overflow-hidden relative bg-refly-bg-content-z2">
        <div className="absolute top-[17px] right-[17px] z-10">
          <SettingItem showName={false} avatarAlign={'right'} />
        </div>

        {/* Header */}
        <div className="px-6 pt-5 pb-0">
          <h1 className="text-xl font-semibold text-refly-text-0 mb-4">
            {t('loggedHomePage.siderMenu.marketplace')}
          </h1>

          {/* Category tabs — show only after categories loaded */}
          {templateCategories.length > 0 && (
            <div className="flex items-center justify-start gap-2 flex-wrap mb-1">
              {/* "All" tab */}
              <div
                className={cn(
                  'flex-shrink-0 whitespace-nowrap px-3 py-1.5 text-sm leading-5 cursor-pointer rounded-[40px] transition-all duration-300 ease-in-out transform',
                  {
                    '!bg-refly-primary-default text-white font-semibold shadow-sm scale-105':
                      selectedCategoryId === ALL_CATEGORY,
                    'text-refly-text-0 hover:bg-refly-tertiary-hover hover:scale-[1.02]':
                      selectedCategoryId !== ALL_CATEGORY,
                  },
                )}
                onClick={() => handleCategoryClick(ALL_CATEGORY)}
              >
                {t('template.allTemplates', 'All')}
              </div>
              {templateCategories.map((category) => (
                <div
                  key={category.categoryId}
                  className={cn(
                    'flex-shrink-0 whitespace-nowrap px-3 py-1.5 text-sm leading-5 cursor-pointer rounded-[40px] transition-all duration-300 ease-in-out transform',
                    {
                      '!bg-refly-primary-default text-white font-semibold shadow-sm scale-105':
                        category.categoryId === selectedCategoryId,
                      'text-refly-text-0 hover:bg-refly-tertiary-hover hover:scale-[1.02]':
                        category.categoryId !== selectedCategoryId,
                    },
                  )}
                  onClick={() => handleCategoryClick(category.categoryId)}
                >
                  {category.labelDict?.[currentLanguage] ?? category.labelDict?.en ?? category.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Template list — always rendered, regardless of category loading state */}
        <div className="flex-1 min-h-0">
          <Suspense fallback={skeletonGrid}>
            <TemplateList
              source="front-page"
              scrollableTargetId="marketplace-scrollable-div"
              categoryId={effectiveCategoryId}
              className="!bg-transparent"
            />
          </Suspense>
        </div>
      </div>
    </>
  );
});

MarketplacePageContent.displayName = 'MarketplacePageContent';

const MarketplacePage = () => {
  return (
    <MarketplaceErrorBoundary>
      <MarketplacePageContent />
    </MarketplaceErrorBoundary>
  );
};

MarketplacePage.displayName = 'MarketplacePage';

export default MarketplacePage;
