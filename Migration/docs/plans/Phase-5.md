# Phase 5: Stock Detail Screens (Price, Sentiment, News)

**Estimated Tokens:** ~60,000
**Dependencies:** Phase 4 (Search & Portfolio complete)
**Goal:** Implement the 3 Stock Detail sub-tabs (Price, Sentiment, News) with full data display and interactions.

---

## Phase Goal

Complete the stock detail views that show historical prices, sentiment analysis, and news articles. By the end of this phase:

1. Price tab displays OHLCV data in a list
2. Sentiment tab shows individual article analysis and daily aggregates
3. News tab displays articles with links to full content
4. All tabs use efficient list rendering (FlatList with virtualization)
5. Data updates when ticker or date range changes

**Success Criteria:**
- [ ] Price tab shows stock price history
- [ ] Sentiment tab shows word counts and sentiment labels
- [ ] News tab shows articles with clickable links
- [ ] All tabs handle empty states
- [ ] Lists scroll smoothly with 100+ items

---

## Tasks

### Task 1: Implement Price Screen

**Files to Create:**
- `src/screens/PriceScreen.tsx` (full implementation)
- `src/components/stock/PriceListItem.tsx`
- `src/components/stock/StockMetadataCard.tsx`

**Reference:** `PriceFragment.java`, `StockRecycler.java`

**Implementation:**

1. **Display Stock Metadata**
   - Card at top showing: Ticker, Company Name, Exchange, Description
   - Fetch from SymbolDetails using `useQuery`

2. **Render Price List**
   - FlatList of PriceListItem components
   - Each item shows: Date, Open, Close, High, Low, Volume
   - Color coding:
     - Green row if Close > Open (bullish)
     - Red row if Close < Open (bearish)
     - Gray if Close == Open (neutral)

3. **Format Numbers**
   - Use utility functions from Phase 1:
     - `formatCurrency()` for prices
     - `formatVolume()` for volume (e.g., "1.5M")

4. **Reverse Order**
   - Show most recent date first
   - Sort data by date descending before rendering

5. **Add Header Row**
   - Fixed header showing column labels: Date | Open | Close | High | Low | Volume

**Verification:**
- [ ] Price list displays correctly with color coding
- [ ] Numbers formatted properly
- [ ] Most recent dates appear first
- [ ] Smooth scrolling with 30+ items

**Commit Message:**
```
feat(price): implement price screen with OHLCV data display

- Created PriceScreen with stock metadata card
- Added PriceListItem with color coding (green/red/gray)
- Formatted prices and volume with utility functions
- Sorted data by date descending (most recent first)
- Added fixed header row with column labels
```

**Estimated Tokens:** ~15,000

---

### Task 2: Implement Sentiment Screen

**Files to Create:**
- `src/screens/SentimentScreen.tsx` (full implementation)
- `src/components/sentiment/CombinedWordItem.tsx`
- `src/components/sentiment/SingleWordItem.tsx`
- `src/components/sentiment/SentimentToggle.tsx`

**Reference:** `WordCountFragment.java`, `CombinedWordCountRecycler.java`, `SingleWordCountRecycler.java`

**Implementation:**

1. **Create Toggle Button**
   - Switch between "Daily Aggregate" and "Individual Articles" views
   - Similar to Android's two RecyclerViews

2. **Display Daily Aggregate View**
   - FlatList of CombinedWordItem components
   - Each item shows:
     - Date
     - Total positive/negative word counts
     - Sentiment label (POS/NEG/NEUT) with color chip
     - Sentiment score
     - Predictions: 1-day, 2-weeks, 1-month (with color coding)
   - Reference: `CombinedWordCountRecycler.java`

3. **Display Individual Articles View**
   - FlatList of SingleWordItem components
   - Each item shows:
     - Article title (truncated if long)
     - Date
     - Positive/negative word counts
     - Sentiment label
     - Sentiment score
   - Reference: `SingleWordCountRecycler.java`

4. **Color Code Sentiment**
   - POS: Green background
   - NEG: Red background
   - NEUT: Gray background

5. **Format Predictions**
   - Show as percentages: "+5.2%", "-2.1%"
   - Color: Green for positive, Red for negative

**Verification:**
- [ ] Toggle switches between aggregate and individual views
- [ ] Daily aggregate shows correct data
- [ ] Individual articles display correctly
- [ ] Sentiment colors match sentiment labels
- [ ] Predictions formatted as percentages

**Commit Message:**
```
feat(sentiment): implement sentiment screen with aggregate and individual views

- Created SentimentScreen with toggle between views
- Added CombinedWordItem showing daily aggregated sentiment
- Added SingleWordItem showing per-article sentiment analysis
- Implemented sentiment color coding (POS/NEG/NEUT)
- Formatted predictions as percentages with color coding
```

**Estimated Tokens:** ~20,000

---

### Task 3: Implement News Screen

**Files to Create:**
- `src/screens/NewsScreen.tsx` (full implementation)
- `src/components/news/NewsListItem.tsx`

**Reference:** `NewsFragment.java`, `NewsRecycler.java`

**Implementation:**

1. **Display News List**
   - FlatList of NewsListItem components
   - Each item shows:
     - Article title
     - Publisher name
     - Published date (formatted as "Jan 15, 2025")
     - Description (truncated to 2-3 lines)
     - Thumbnail image if available

2. **Make Items Tappable**
   - Tap to open article URL in browser
   - Use `Linking.openURL()` from React Native
   - Handle case where URL is invalid

3. **Add Pull-to-Refresh**
   - Refresh news data when user pulls down
   - Show loading indicator during refresh

4. **Handle Empty State**
   - "No news available for this date range"
   - Suggest expanding date range

**Verification:**
- [ ] News list displays articles
- [ ] Tapping opens article in browser
- [ ] Pull-to-refresh works
- [ ] Empty state shows when no articles

**Commit Message:**
```
feat(news): implement news screen with article display

- Created NewsScreen with FlatList of articles
- Added NewsListItem showing title, publisher, date, description
- Implemented tap to open article URL in browser
- Added pull-to-refresh functionality
- Handled empty state for no articles
```

**Estimated Tokens:** ~12,000

---

### Task 4: Add Charts/Visualizations (Optional Enhancement)

**Files to Create:**
- `src/components/charts/StockPriceChart.tsx`
- `src/components/charts/SentimentChart.tsx`

**Implementation:**

1. **Install Charting Library**
   - `react-native-chart-kit` or `victory-native`
   - Both work with Expo

2. **Create Stock Price Chart**
   - Line chart showing Close price over time
   - X-axis: Dates
   - Y-axis: Price
   - Add to top of PriceScreen

3. **Create Sentiment Chart**
   - Bar chart showing sentiment score by date
   - Positive bars in green, negative in red
   - Add to SentimentScreen

**Note:** This is optional. Skip if time is limited. Focus on core functionality first.

**Estimated Tokens:** ~8,000

---

### Task 5: Optimize List Performance

**Files to Modify:**
- All screen files with FlatLists

**Implementation:**

1. **Enable List Optimizations**
   ```typescript
   <FlatList
     data={data}
     renderItem={renderItem}
     keyExtractor={item => item.id.toString()}
     removeClippedSubviews={true}
     maxToRenderPerBatch={10}
     updateCellsBatchingPeriod={50}
     initialNumToRender={10}
     windowSize={21}
   />
   ```

2. **Memoize List Items**
   - Wrap item components with `React.memo()`
   - Prevents unnecessary re-renders

3. **Use getItemLayout (if fixed height)**
   - Provides exact item heights for better performance
   - Enables instant scrolling to any position

**Verification:**
- [ ] Lists scroll smoothly with 100+ items
- [ ] No frame drops during scrolling
- [ ] Memory usage is reasonable

**Commit Message:**
```
perf(lists): optimize FlatList performance for large datasets

- Enabled removeClippedSubviews and virtualization
- Memoized list item components with React.memo
- Added getItemLayout for fixed-height items
- Configured optimal rendering batch sizes
```

**Estimated Tokens:** ~5,000

---

## Phase Verification

### Complete Phase Checklist

- [ ] Price screen displays OHLCV data
- [ ] Sentiment screen shows aggregate and individual views
- [ ] News screen displays articles with links
- [ ] All screens handle empty states
- [ ] Lists perform well with large datasets

### Integration Testing

Test this complete flow:

1. Search for "AAPL"
2. Select from results (triggers data sync)
3. Navigate to Price tab → Verify prices display
4. Navigate to Sentiment tab → Verify sentiment data displays
5. Toggle between aggregate and individual views
6. Navigate to News tab → Verify articles display
7. Tap an article → Verify opens in browser

### Performance Testing

- Load a stock with 90+ days of data (90 prices, 100+ news articles)
- Scroll through each list
- Verify smooth scrolling (60 FPS target)
- Monitor memory usage (should stay under 200MB)

---

## Next Steps

Proceed to **Phase 6: Animations & Polish** to add animations and improve UX.
