## Purpose

useTableData in @gntik-ai/blocks turns DataTable paging, sorting and filters into abortable, cached requests and returns props for DataTable and LoadMoreFooter.

## ADDED Requirements

### Requirement: Only the latest committed request can update data

The hook SHALL start requests from committed state, coalescing synchronous table callbacks. It SHALL abort superseded requests and ignore their late success or rejection even if the endpoint ignores its signal. getRows and onError identities MUST NOT trigger requests, and the latest callbacks SHALL be used. Rendering MUST NOT call getRows or read document.

#### Scenario: Fast paging

- **GIVEN** page 3 is loading
- **WHEN** page 4 is requested and resolves before page 3
- **THEN** page 3's signal is aborted and only page 4's result applies

#### Scenario: Resize and sort

- **GIVEN** page 2 at size 20
- **WHEN** the table resizes to 50 or changes sort
- **THEN** one request uses page 1 and the new size or sort

#### Scenario: Filters and views

- **WHEN** filters change by JSON.stringify value
- **THEN** one request uses page 1 with the new filters
- **AND** an equal object or changed callback identity makes no request
- **AND** a saved view clearing sort requests sort null

### Requirement: Retained data describes the displayed page

With keepPreviousData=true, rows, page, pageSize and rowCount SHALL describe the last resolved page while params describes the requested page. isFetching SHALL indicate pending work; requested sort SHALL appear immediately and roll back to the synchronously recorded confirmed sort on failure. With keepPreviousData=false an uncached query SHALL show empty rows, the requested page, loading=true and the last known rowCount.

#### Scenario: Pending page

- **GIVEN** page 2 is displayed
- **WHEN** page 3 is requested
- **THEN** retained rows and tableProps.page remain on page 2 until success
- **AND** params.page is 3 and isFetching is true

### Requirement: Cache entries have per-instance freshness

The hook SHALL cache by page, pageSize, sort, JSON filters and cursor, with cacheTime=30000 ms by default. A fresh hit SHALL abort pending work, render without fetching and clear error. An expired hit SHALL render cached data without loading placeholders and make one background request. cacheTime=0 SHALL disable caching. refetch SHALL bypass freshness; invalidate SHALL clear the cache and reload. Foreground revalidation SHALL skip hidden documents and active requests.

#### Scenario: Fresh and expired visits

- **GIVEN** a cached page
- **WHEN** it is visited before expiry
- **THEN** it renders without getRows
- **WHEN** visited after expiry
- **THEN** it renders at once and revalidates once

### Requirement: Errors retain data and support retries

Rejections and synchronous throws SHALL settle loading and error atomically, preserve the last resolved rows, and call the latest onError once. Aborts SHALL remain silent. Success or a fresh cache hit SHALL clear error. refetch and a repeated failed page request SHALL retry failed params. Footer errors SHALL be non-empty English messages.

#### Scenario: Failure then retry

- **GIVEN** page 1 is displayed
- **WHEN** page 2 rejects and refetch then succeeds
- **THEN** page 1 remains on failure and page 2 appears on success with error null

### Requirement: Cursor pages accumulate without duplicate revalidation

The first cursor SHALL be null. loadMore SHALL request nextCursor and append its rows, ignoring repeats while pending. Null or empty nextCursor SHALL exhaust the list. onRetry SHALL retry the failed cursor, refetch SHALL restart from page 1, and background revalidation SHALL preserve the accumulated prefix without duplicate appends. lastAppend.seq SHALL increase only on successful appends. Each footer attempt SHALL settle loading=false together with its result.

#### Scenario: Append, failure and retry

- **GIVEN** the first result has nextCursor c2
- **WHEN** loadMore fails then onRetry succeeds with nextCursor null
- **THEN** both attempts request c2, rows accumulate once and hasMore is false

### Requirement: Lifecycle cancellation is safe

Unmount and enabled=false SHALL abort in-flight work. Disabled hooks SHALL make no request and have isLoading=false. Late settlements after unmount SHALL not update state or call onError. StrictMode's surviving request SHALL apply successfully.

#### Scenario: Unmount

- **WHEN** the hook unmounts during a request
- **THEN** its signal is aborted and later settlements are ignored

### Requirement: Public exports and catalog evidence accompany the hook

The hook and its types SHALL be exported from @gntik-ai/blocks with TSDoc, numbered-page and cursor live previews, serialisable-filter and cache limitations, and npm-only availability. A minor changeset and generated registries SHALL accompany the change.

#### Scenario: Consumer adoption

- **WHEN** a consumer imports useTableData from the package
- **THEN** it can spread tableProps into DataTable or compose loadMoreProps with a separate LoadMoreFooter
- **AND** both compositions are demonstrated in the catalog
