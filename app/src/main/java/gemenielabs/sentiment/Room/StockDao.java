package gemenielabs.sentiment.Room;

import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.Query;
import androidx.room.OnConflictStrategy;


import java.util.List;

@Dao
public interface StockDao {


    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertStock(StockDetails stockDetails);

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertSymbol(SymbolDetails symbolDetails);

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertNewsContent(NewsDetails newsDetails);

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertWordCountContent(WordCountDetails wordCountDetails);

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertPortfolioDetails(PortfolioDetails portfolioDetails);

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertCombinedWordDetails(CombinedWordDetails combinedWordDetails);

    @Delete(entity = StockDetails.class)
    void deleteByStockDetails(List<StockDetails> stockDetails);

    @Delete(entity = NewsDetails.class)
    void deleteByNewsDetails(List<NewsDetails> newsDetails);

    @Delete(entity = WordCountDetails.class)
    void deleteByWordCountDetails(List<WordCountDetails> wordCountDetails);

    @Delete(entity = CombinedWordDetails.class)
    void deleteByCombinedWordDetails(List<CombinedWordDetails> combinedWordDetails);

    @Delete(entity = PortfolioDetails.class)
    void deleteByPortfolioDetails(PortfolioDetails portfolioDetails);

    @Delete(entity = SymbolDetails.class)
    void deleteBySymbolDetails(SymbolDetails symbolDetails);

    @Query("SELECT * FROM stock_details WHERE ticker = :ticker ORDER BY date DESC")
    List<StockDetails> getJSONData(String ticker);

    @Query("SELECT * FROM stock_details WHERE ticker = :ticker AND date = :date")
    StockDetails getSingleStock(String ticker, String date);

    @Query("SELECT * FROM stock_details WHERE ticker = :ticker AND date = (SELECT MAX(date) FROM stock_details WHERE ticker = :ticker)")
    StockDetails getSingleStockTicker(String ticker);

    @Query("SELECT * FROM symbol_details WHERE ticker = :ticker")
    SymbolDetails getDailySymbol(String ticker);

    @Query("SELECT * FROM stock_details WHERE ticker = :ticker ORDER BY date DESC")
    List<StockDetails> getStockDetails(String ticker);

    @Query("SELECT * FROM news_details WHERE ticker = :ticker ORDER BY date DESC")
    List<NewsDetails> getNewsDetails(String ticker);

    @Query("SELECT * FROM word_count_details WHERE ticker = :ticker ORDER BY date DESC")
    List<WordCountDetails> getWordCountDetails(String ticker);

    @Query("SELECT * FROM word_count_details WHERE ticker = :ticker And date = :date")
    List<WordCountDetails> getWordCountDetailsDate(String ticker, String date);

    @Query("SELECT * FROM word_count_details WHERE ticker = :ticker AND hash = :hash")
    WordCountDetails getSingleHashedWordCountDetails(String ticker, int hash);

    @Query("SELECT * FROM combined_word_count_details WHERE ticker = :ticker ORDER BY date DESC")
    List<CombinedWordDetails> getCombinedWordDetails(String ticker);

    @Query("SELECT * FROM combined_word_count_details WHERE ticker = :ticker AND date =:date")
    CombinedWordDetails getCombinedWordDetailsDate(String ticker, String date);

    @Query("SELECT * FROM combined_word_count_details WHERE ticker = :ticker")
    CombinedWordDetails getCombinedWordDetailsUpdate(String ticker);

    @Query("SELECT * FROM portfolio_details ORDER BY name ASC")
    List<PortfolioDetails> getPortfolioDetails();

    @Query("SELECT * FROM portfolio_details WHERE ticker = :ticker")
    PortfolioDetails getSinglePortfolioDetails(String ticker);

    @Query("SELECT * FROM symbol_details WHERE ticker = :ticker")
    SymbolDetails getSingleSymbolDetails(String ticker);

}