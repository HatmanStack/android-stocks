package gemenielabs.sentiment.Room;

import androidx.room.Database;
import androidx.room.RoomDatabase;

@Database(entities = {StockDetails.class, SymbolDetails.class,NewsDetails.class,
        PortfolioDetails.class, WordCountDetails.class, CombinedWordDetails.class},
         version = 4)
public abstract class StockDatabase extends RoomDatabase {

    public abstract StockDao stockDao();
}


