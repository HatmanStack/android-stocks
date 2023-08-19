package gemenielabs.sentiment.Room;

import androidx.annotation.NonNull;
import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "portfolio_details")
public class PortfolioDetails {
    @PrimaryKey
    @ColumnInfo(name = "ticker")
    @NonNull
    public String ticker;

    @ColumnInfo(name = "next")
    public String next;

    @ColumnInfo(name = "name")
    public String name;

    @ColumnInfo(name = "wks")
    public String wks;

    @ColumnInfo(name = "mnth")
    public String mnth;

    @NonNull
    public String getTicker() {
        return ticker;
    }

    public void setTicker(@NonNull String ticker) {
        this.ticker = ticker;
    }

    public String getNext() {
        return next;
    }

    public void setNext(String next) {
        this.next = next;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getWks() {
        return wks;
    }

    public void setWks(String wks) {
        this.wks = wks;
    }

    public String getMnth() {
        return mnth;
    }

    public void setMnth(String mnth) {
        this.mnth = mnth;
    }

    public PortfolioDetails(@NonNull String ticker, String next, String name, String wks, String mnth) {
        this.ticker = ticker;
        this.next = next;
        this.name = name;
        this.wks = wks;
        this.mnth = mnth;
    }


}
