/**
 * Central export for all database repositories
 * Exports each repository as a namespace to avoid naming conflicts
 */

import * as StockRepository from './stock.repository';
import * as SymbolRepository from './symbol.repository';
import * as NewsRepository from './news.repository';
import * as WordCountRepository from './wordCount.repository';
import * as CombinedWordRepository from './combinedWord.repository';
import * as PortfolioRepository from './portfolio.repository';

export {
  StockRepository,
  SymbolRepository,
  NewsRepository,
  WordCountRepository,
  CombinedWordRepository,
  PortfolioRepository,
};
