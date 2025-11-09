# Phase 4: Search & Portfolio Screens Implementation

**Estimated Tokens:** ~45,000
**Dependencies:** Phase 3 (UI Foundation complete)
**Goal:** Fully implement Search and Portfolio screens with all functionality from the Android app.

---

## Phase Goal

Complete the Search and Portfolio screens with full feature parity. By the end of this phase:

1. Search screen allows ticker search with calendar date selection
2. Search results display company information
3. Tapping a result navigates to Stock Detail screen and triggers data sync
4. Portfolio screen displays user's watchlist
5. Can add/remove stocks from portfolio
6. Portfolio shows predictions for each stock

**Success Criteria:**
- [ ] Can search for stocks by ticker or company name
- [ ] Search results display correctly with metadata
- [ ] Selecting a stock triggers data sync and navigation
- [ ] Portfolio displays all saved stocks
- [ ] Can add stock to portfolio from Stock Detail screen
- [ ] Can remove stock from portfolio with confirmation
- [ ] Portfolio persists across app restarts

---

## Tasks

### Task 1: Implement Stock Symbol Search

**Files to Create:**
- `src/screens/SearchScreen.tsx` (full implementation)
- `src/components/search/SearchBar.tsx`
- `src/components/search/SearchResultItem.tsx`

**Reference:** `SearchFragment.java`, `SearchRecycler.java`, `SetSearchSymbolData.java`

**Implementation:**

1. **Add Search Input**
   - TextInput with search icon
   - Debounce input (300ms) to avoid excessive API calls
   - Clear button to reset search

2. **Implement Search Logic**
   - Use `useSymbolSearch` hook from Phase 2
   - Search by ticker (exact match) or company name (contains)
   - Query local SymbolDetails table first
   - Fallback to Tiingo search API if not found locally

3. **Display Search Results**
   - FlatList of SearchResultItem components
   - Show: Ticker, Company Name, Exchange
   - Tap to select stock

4. **Add Calendar Integration**
   - DateRangePicker at top
   - Stores selected date range in StockContext

5. **Handle Selection**
   - On tap: Update StockContext with selected ticker
   - Navigate to Stock Detail tab
   - Trigger `syncAllData(ticker, days)` in background

**Verification:**
- [ ] Search returns results for valid tickers
- [ ] Can search by partial company name
- [ ] Date picker updates date range
- [ ] Selecting stock navigates to details

**Commit Message:**
```
feat(search): implement stock symbol search with calendar

- Added search input with debouncing and ticker/name search
- Integrated DateRangePicker for date range selection
- Created SearchResultItem component for result display
- Implemented navigation to StockDetail on selection
- Triggers data sync for selected ticker
```

**Estimated Tokens:** ~15,000

---

### Task 2: Implement Portfolio Screen

**Files to Create:**
- `src/screens/PortfolioScreen.tsx` (full implementation)
- `src/components/portfolio/PortfolioItem.tsx`
- `src/components/portfolio/AddStockButton.tsx`

**Reference:** `PortfolioFragment.java`, `PortfolioRecycler.java`

**Implementation:**

1. **Display Portfolio List**
   - Use `usePortfolio` hook
   - FlatList of PortfolioItem components
   - Show: Ticker, Company Name, Predictions (1-day, 2-weeks, 1-month)
   - Color-code predictions: Green (positive), Red (negative)

2. **Add Stock to Portfolio**
   - Floating action button (FAB) to add stock
   - Opens search modal or navigates to Search tab
   - Add button also available in Stock Detail screen header

3. **Remove Stock from Portfolio**
   - Swipe-to-delete gesture
   - Or long-press to show delete confirmation popup
   - Reference: Android uses PopupWindow for confirmation

4. **Refresh Portfolio Data**
   - Pull-to-refresh to update predictions
   - Refresh all stocks' data in background

5. **Empty State**
   - "No stocks in portfolio" message
   - Button to navigate to Search screen

**Verification:**
- [ ] Portfolio displays all saved stocks
- [ ] Add stock functionality works
- [ ] Remove stock with confirmation works
- [ ] Pull-to-refresh updates data
- [ ] Empty state shows when portfolio is empty

**Commit Message:**
```
feat(portfolio): implement portfolio screen with add/remove functionality

- Created PortfolioScreen with FlatList of saved stocks
- Added PortfolioItem showing predictions with color coding
- Implemented add stock via FAB and Stock Detail header button
- Added swipe-to-delete with confirmation popup
- Implemented pull-to-refresh for data updates
- Added empty state for empty portfolio
```

**Estimated Tokens:** ~18,000

---

### Task 3: Add Stock Detail Header with Portfolio Actions

**Files to Modify:**
- `src/screens/StockDetailScreen.tsx`
- `src/navigation/MainTabNavigator.tsx`

**Implementation:**

1. **Add Header Right Button**
   - Star icon (outline when not in portfolio, filled when in portfolio)
   - Tapping toggles add/remove from portfolio

2. **Show Company Name in Header**
   - Fetch from SymbolDetails using selected ticker
   - Display as header title

3. **Add Floating Action Menu (Optional)**
   - Alternative to header button
   - Shows options: Add to Portfolio, Share, Refresh

**Verification:**
- [ ] Star icon reflects portfolio status
- [ ] Tapping adds/removes from portfolio
- [ ] Header shows company name

**Commit Message:**
```
feat(stock-detail): add portfolio actions to header

- Added star icon to header showing portfolio status
- Implemented toggle to add/remove from portfolio
- Header displays company name from SymbolDetails
- Icon state syncs with portfolio changes
```

**Estimated Tokens:** ~8,000

---

### Task 4: Handle Data Loading States

**Files to Modify:**
- All screens from Phase 3

**Implementation:**

1. **Show Loading During Sync**
   - When user selects a stock, show progress indicator
   - Display status: "Fetching stock prices...", "Analyzing sentiment..."
   - Use modal or bottom sheet with progress bar

2. **Cache Awareness**
   - If data exists in database, show immediately
   - Refresh in background if stale (>24 hours old)

3. **Offline Handling**
   - Detect offline state
   - Show cached data with "Offline" badge
   - Disable refresh actions

**Verification:**
- [ ] Loading states show during sync
- [ ] Cached data appears instantly
- [ ] Offline mode works with cached data

**Commit Message:**
```
feat(data): improve data loading states and offline handling

- Added progress indicator during data sync
- Implemented cache-first strategy for instant display
- Added offline detection with "Offline" badge
- Background refresh for stale data (>24 hours)
```

**Estimated Tokens:** ~4,000

---

## Phase Verification

### Complete Phase Checklist

- [ ] Search screen fully functional with calendar
- [ ] Can search and select stocks
- [ ] Portfolio screen displays and manages watchlist
- [ ] Add/remove from portfolio works correctly
- [ ] Data sync triggers automatically
- [ ] Loading and offline states handled

### Integration Testing

Test these user flows:

1. **Add to Portfolio Flow:**
   - Open Search screen
   - Search for "AAPL"
   - Select from results
   - Wait for data sync
   - Tap star icon to add to portfolio
   - Navigate to Portfolio tab
   - Verify AAPL appears in list

2. **Remove from Portfolio Flow:**
   - In Portfolio tab, swipe-to-delete on a stock
   - Confirm deletion
   - Verify stock removed from list

3. **Offline Flow:**
   - Disable network
   - Open app
   - Verify portfolio shows cached data
   - Attempt refresh (should show offline message)

---

## Next Steps

Proceed to **Phase 5: Stock Detail Screens** to implement Price, Sentiment, and News tabs.
