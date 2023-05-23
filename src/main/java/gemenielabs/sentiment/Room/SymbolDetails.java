package gemenielabs.sentiment.Room;

import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "symbol_details")
public class SymbolDetails {
    @PrimaryKey(autoGenerate = true)
    int id;

    @ColumnInfo(name = "longDescription")
    public String longDescription;

    @ColumnInfo(name = "exchangeCode")
    public String exchangeCode;

    @ColumnInfo(name = "name")
    public String name;

    @ColumnInfo(name = "startDate")
    public String startDate;

    @ColumnInfo(name = "ticker")
    public String ticker;

    @ColumnInfo(name = "endDate")
    public String endDate;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getLongDescription() {
        return longDescription;
    }

    public void setLongDescription(String longDescription) {
        this.longDescription = longDescription;
    }

    public String getExchangeCode() {
        return exchangeCode;
    }

    public void setExchangeCode(String exchangeCode) {
        this.exchangeCode = exchangeCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getTicker() {
        return ticker;
    }

    public void setTicker(String ticker) {
        this.ticker = ticker;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public void SymbolDetails(String longDescription, String exchangeCode, String name,
                         String startDate, String ticker, String endDate) {
        this.longDescription = longDescription;
        this.exchangeCode = exchangeCode;
        this.name = name;
        this.startDate = startDate;
        this.ticker = ticker;
        this.endDate = endDate;

    }
}

