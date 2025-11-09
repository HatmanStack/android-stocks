# Phase 3: UI Foundation & Navigation

**Estimated Tokens:** ~92,000
**Dependencies:** Phase 2 (Core Data Processing complete)
**Goal:** Build the navigation structure, shared UI components, theming system, and establish patterns for screen development.

---

## Phase Goal

Create the foundation for all user interface elements. By the end of this phase, you'll have:

1. Complete navigation hierarchy (Bottom Tabs + Stack + Material Top Tabs)
2. Theme system with Material Design 3
3. Shared component library (cards, lists, loading states, error displays)
4. Context providers for global state
5. Screen skeletons for all 5 main screens
6. Type-safe navigation

**Success Criteria:**
- [ ] Can navigate between all 3 main tabs (Search, Stock Details, Portfolio)
- [ ] Stock Details screen has 3 working sub-tabs (Price, Sentiment, News)
- [ ] Theme system applies consistent colors and typography
- [ ] Shared components render correctly with sample data
- [ ] Navigation state persists across app restarts

---

## Prerequisites

- Phase 1 and 2 100% complete
- React Navigation and React Native Paper installed
- Familiarity with React Navigation patterns

**Android Files to Reference:**
- `MainActivity.java` - Main activity structure
- `MainHostFragment.java` - ViewPager with 3 tabs
- `StockHostFragment.java` - Nested ViewPager for stock details
- All Fragment files in `Fragments/` directory

---

## Tasks

### Task 1: Set Up Navigation Infrastructure

**Goal:** Configure React Navigation with the complete navigation hierarchy matching the Android app.

**Files to Create:**
- `src/navigation/RootNavigator.tsx` - Root stack navigator
- `src/navigation/MainTabNavigator.tsx` - Bottom tab navigator (3 tabs)
- `src/navigation/StockDetailNavigator.tsx` - Material top tabs (Price, Sentiment, News)
- `src/navigation/navigationTypes.ts` - TypeScript types for navigation

**Implementation Steps:**

1. **Define Navigation Types**
   - Create type-safe navigation parameters
   ```typescript
   export type RootStackParamList = {
     MainTabs: undefined;
   };

   export type MainTabParamList = {
     Search: undefined;
     StockDetail: { ticker: string };
     Portfolio: undefined;
   };

   export type StockDetailTabParamList = {
     Price: { ticker: string };
     Sentiment: { ticker: string };
     News: { ticker: string };
   };
   ```

2. **Create Main Tab Navigator**
   - File: `src/navigation/MainTabNavigator.tsx`
   - Implementation:
     ```typescript
     import React from 'react';
     import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
     import { Ionicons } from '@expo/vector-icons';
     import SearchScreen from '../screens/SearchScreen';
     import StockDetailScreen from '../screens/StockDetailScreen';
     import PortfolioScreen from '../screens/PortfolioScreen';
     import { MainTabParamList } from './navigationTypes';

     const Tab = createBottomTabNavigator<MainTabParamList>();

     export function MainTabNavigator() {
       return (
         <Tab.Navigator
           screenOptions={({ route }) => ({
             tabBarIcon: ({ focused, color, size }) => {
               let iconName: keyof typeof Ionicons.glyphMap;

               if (route.name === 'Search') {
                 iconName = focused ? 'search' : 'search-outline';
               } else if (route.name === 'StockDetail') {
                 iconName = focused ? 'stats-chart' : 'stats-chart-outline';
               } else if (route.name === 'Portfolio') {
                 iconName = focused ? 'briefcase' : 'briefcase-outline';
               } else {
                 iconName = 'help-outline';
               }

               return <Ionicons name={iconName} size={size} color={color} />;
             },
             tabBarActiveTintColor: '#1976D2', // Will use theme colors in Task 2
             tabBarInactiveTintColor: '#9E9E9E',
           })}
         >
           <Tab.Screen
             name="Search"
             component={SearchScreen}
             options={{ title: 'Search Stocks' }}
           />
           <Tab.Screen
             name="StockDetail"
             component={StockDetailScreen}
             options={{ title: 'Stock Details' }}
           />
           <Tab.Screen
             name="Portfolio"
             component={PortfolioScreen}
             options={{ title: 'Portfolio' }}
           />
         </Tab.Navigator>
       );
     }
     ```

3. **Create Stock Detail Sub-Tabs**
   - File: `src/navigation/StockDetailNavigator.tsx`
   - Implementation:
     ```typescript
     import React from 'react';
     import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
     import PriceScreen from '../screens/PriceScreen';
     import SentimentScreen from '../screens/SentimentScreen';
     import NewsScreen from '../screens/NewsScreen';
     import { StockDetailTabParamList } from './navigationTypes';

     const Tab = createMaterialTopTabNavigator<StockDetailTabParamList>();

     export function StockDetailNavigator() {
       return (
         <Tab.Navigator
           screenOptions={{
             tabBarActiveTintColor: '#1976D2',
             tabBarInactiveTintColor: '#666',
             tabBarIndicatorStyle: { backgroundColor: '#1976D2' },
             tabBarLabelStyle: { fontSize: 14, fontWeight: '600' },
             tabBarStyle: { backgroundColor: '#fff' },
           }}
         >
           <Tab.Screen
             name="Price"
             component={PriceScreen}
             options={{ title: 'Price' }}
           />
           <Tab.Screen
             name="Sentiment"
             component={SentimentScreen}
             options={{ title: 'Sentiment' }}
           />
           <Tab.Screen
             name="News"
             component={NewsScreen}
             options={{ title: 'News' }}
           />
         </Tab.Navigator>
       );
     }
     ```
   - Material Top Tabs enable horizontal swiping (matches Android ViewPager)

4. **Configure Navigation Persistence**
   - Save/restore navigation state using AsyncStorage

5. **Set Up Deep Linking**
   - Configure for URLs like `stockapp://stock/AAPL`

**Verification:**
- [ ] All 3 main tabs render and can be navigated
- [ ] Stock Detail shows 3 sub-tabs
- [ ] Navigation state persists on app reload

**Commit Message:**
```
feat(navigation): implement complete navigation hierarchy

- Created RootNavigator with stack and tab navigators
- Implemented MainTabNavigator with 3 bottom tabs (Search, Stock, Portfolio)
- Added StockDetailNavigator with material top tabs (Price, Sentiment, News)
- Configured navigation persistence with AsyncStorage
- Added TypeScript types for type-safe navigation
```

**Estimated Tokens:** ~18,000

---

### Task 2: Implement Theme System

**Goal:** Create a comprehensive theming system using React Native Paper's Material Design 3.

**Files to Create:**
- `src/theme/colors.ts` - Color palette
- `src/theme/typography.ts` - Font styles
- `src/theme/theme.ts` - Complete theme object
- `src/contexts/ThemeContext.tsx` - Theme provider

**Implementation Steps:**

1. **Define Color Palette**
   - Match Material Design 3 colors
   - Include sentiment-specific colors:
     - Positive (green): `#4CAF50`
     - Negative (red): `#F44336`
     - Neutral (gray): `#9E9E9E`

2. **Create Theme Object**
   ```typescript
   export const theme = {
     ...MD3LightTheme,
     colors: {
       ...MD3LightTheme.colors,
       primary: '#1976D2',
       secondary: '#424242',
       positive: '#4CAF50',
       negative: '#F44336',
       neutral: '#9E9E9E',
     },
   };
   ```

3. **Wrap App with Providers**
   ```typescript
   <PaperProvider theme={theme}>
     <QueryClientProvider client={queryClient}>
       <NavigationContainer>
         <RootNavigator />
       </NavigationContainer>
     </QueryClientProvider>
   </PaperProvider>
   ```

**Verification:**
- [ ] Theme colors consistent across app
- [ ] Sentiment colors render correctly

**Commit Message:**
```
feat(theme): implement Material Design 3 theming system

- Created color palette with brand and sentiment colors
- Configured React Native Paper theme
- Added sentiment-specific colors (positive, negative, neutral)
- Wrapped app with PaperProvider
```

**Estimated Tokens:** ~12,000

---

### Task 3: Build Shared Component Library

**Goal:** Create reusable UI components that will be used across all screens.

**Files to Create:**
- `src/components/common/StockCard.tsx` - Stock price card
- `src/components/common/NewsCard.tsx` - News article card
- `src/components/common/SentimentChip.tsx` - Sentiment label (POS/NEG/NEUT)
- `src/components/common/LoadingIndicator.tsx` - Loading spinner
- `src/components/common/ErrorDisplay.tsx` - Error message display
- `src/components/common/EmptyState.tsx` - Empty list placeholder

**Implementation Steps:**

1. **Create StockCard**
   - Displays: Date, Open, Close, High, Low, Volume
   - Color-coded: Green if close > open, Red if close < open
   - Reference: `StockRecycler.java`

2. **Create NewsCard**
   - Displays: Title, Publisher, Date, Description
   - Tappable to open article URL
   - Reference: `NewsRecycler.java`

3. **Create SentimentChip**
   - Small chip showing POS/NEG/NEUT
   - Color-coded background
   - Reference: `CombinedWordCountRecycler.java` and `SingleWordCountRecycler.java`

4. **Create LoadingIndicator**
   - Centered activity indicator
   - Used while data is loading

5. **Create ErrorDisplay**
   - Shows error message with retry button
   - Friendly error illustrations

6. **Create EmptyState**
   - "No data available" message
   - Used when lists are empty

**Verification:**
- [ ] All components render with sample props
- [ ] Components match Android UI design
- [ ] Accessibility labels present

**Commit Message:**
```
feat(components): create shared component library

- Created StockCard with OHLCV display and color coding
- Created NewsCard with article metadata
- Created SentimentChip with POS/NEG/NEUT color coding
- Added LoadingIndicator, ErrorDisplay, EmptyState components
- All components include accessibility labels
```

**Estimated Tokens:** ~20,000

---

### Task 4: Create Context Providers for Global State

**Goal:** Set up React Context for global app state (selected ticker, date range).

**Files to Create:**
- `src/contexts/StockContext.tsx` - Selected ticker and date
- `src/contexts/PortfolioContext.tsx` - Portfolio state

**Implementation Steps:**

1. **Create StockContext**
   ```typescript
   interface StockContextType {
     selectedTicker: string | null;
     selectedDate: string;
     setSelectedTicker: (ticker: string) => void;
     setSelectedDate: (date: string) => void;
   }
   ```

2. **Create PortfolioContext**
   - Wraps `usePortfolio` hook from Phase 2
   - Provides portfolio data and add/remove functions globally

3. **Wrap App**
   ```typescript
   <StockProvider>
     <PortfolioProvider>
       {/* Navigation */}
     </PortfolioProvider>
   </StockProvider>
   ```

**Verification:**
- [ ] Context values accessible in all components
- [ ] Changing ticker updates across tabs

**Commit Message:**
```
feat(context): add global state management with React Context

- Created StockContext for selected ticker and date
- Created PortfolioContext for portfolio state
- Wrapped app with context providers
- All screens can access and update global state
```

**Estimated Tokens:** ~10,000

---

### Task 5: Create Screen Skeletons

**Goal:** Create placeholder screens for all 5 main screens with basic layout.

**Files to Create:**
- `src/screens/SearchScreen.tsx`
- `src/screens/StockDetailScreen.tsx` (container for sub-tabs)
- `src/screens/PriceScreen.tsx`
- `src/screens/SentimentScreen.tsx`
- `src/screens/NewsScreen.tsx`
- `src/screens/PortfolioScreen.tsx`

**Implementation Steps:**

1. **Create Basic Screen Structure**
   - Each screen: SafeAreaView + ScrollView/FlatList
   - Show screen title
   - Display "Coming Soon" placeholder

2. **Wire Up Navigation**
   - Link screens to navigators
   - Test navigation between screens

3. **Add Sample Data Display**
   - Use mock data to render lists
   - Verify components work in screen context

**Verification:**
- [ ] All 5 screens accessible via navigation
- [ ] Basic layout renders correctly
- [ ] Mock data displays in lists

**Commit Message:**
```
feat(screens): create screen skeletons for all 5 main screens

- Created SearchScreen, StockDetailScreen, PriceScreen, SentimentScreen, NewsScreen, PortfolioScreen
- Added basic layouts with SafeAreaView and ScrollView
- Wired screens to navigation hierarchy
- Tested navigation flow between all screens
```

**Estimated Tokens:** ~15,000

---

### Task 6: Implement Loading and Error States

**Goal:** Add loading and error handling to all screens.

**Files to Modify:**
- All screen files from Task 3.5

**Implementation Steps:**

1. **Add Loading State**
   ```typescript
   if (isLoading) return <LoadingIndicator />;
   ```

2. **Add Error State**
   ```typescript
   if (error) return <ErrorDisplay error={error} onRetry={refetch} />;
   ```

3. **Add Empty State**
   ```typescript
   if (data.length === 0) return <EmptyState message="No data available" />;
   ```

**Verification:**
- [ ] Loading spinner shows while fetching
- [ ] Error message shows on failure
- [ ] Empty state shows for empty lists

**Commit Message:**
```
feat(screens): add loading, error, and empty states to all screens

- Integrated LoadingIndicator for loading states
- Added ErrorDisplay with retry functionality
- Implemented EmptyState for empty lists
- All screens handle data fetching states gracefully
```

**Estimated Tokens:** ~8,000

---

### Task 7: Add Calendar Date Picker

**Goal:** Implement calendar date picker for the Search screen (matches Android CalendarView).

**Files to Create:**
- `src/components/common/DateRangePicker.tsx`

**Prerequisites:**
- Install `react-native-calendars`: `npx expo install react-native-calendars`

**Implementation Steps:**

1. **Create DateRangePicker Component**
   - Uses `react-native-calendars`
   - Allows selecting date range (start and end date)
   - Matches Android CalendarView UI

2. **Integrate into SearchScreen**
   - Show calendar at top of screen
   - Update date range in StockContext on selection

**Verification:**
- [ ] Calendar renders correctly
- [ ] Date selection updates context
- [ ] Matches Android CalendarView behavior

**Commit Message:**
```
feat(components): add calendar date picker for date range selection

- Created DateRangePicker using react-native-calendars
- Integrated into SearchScreen
- Connected to StockContext for date range updates
- Matches Android CalendarView functionality
```

**Estimated Tokens:** ~9,000

---

## Phase Verification

### Complete Phase Checklist

- [ ] Navigation works across all screens
- [ ] Theme system applies consistent styling
- [ ] All shared components render correctly
- [ ] Context providers manage global state
- [ ] Loading/error/empty states functional
- [ ] Calendar date picker works

### Manual Testing

1. Navigate through all tabs and verify smooth transitions
2. Change ticker in SearchScreen, verify StockDetailScreen updates
3. Test date picker and verify date range updates
4. Test loading states by throttling network
5. Test error states by using invalid ticker

### Next Steps

Proceed to **Phase 4: Search & Portfolio Screens** to implement full functionality for these screens.
