package gemenielabs.sentiment.Room;

import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.PrimaryKey;


@Entity(tableName = "stock_details")
public class StockDetails {
    @PrimaryKey(autoGenerate = true)
    public int id;

    @ColumnInfo(name = "hash")
    public int hash;

    @ColumnInfo(name = "date")
    public String date;

    @ColumnInfo(name = "ticker")
    public String ticker;

    @ColumnInfo(name = "close")
    public double close;

    @ColumnInfo(name = "high")
    public double high;

    @ColumnInfo(name = "low")
    public double low;

    @ColumnInfo(name = "open")
    public double open;

    @ColumnInfo(name = "volume")
    public int volume;

    @ColumnInfo(name = "adjClose")
    public float adjClose;

    @ColumnInfo(name = "adjHigh")
    public float adjHigh;

    @ColumnInfo(name = "adjLow")
    public float adjLow;

    @ColumnInfo(name = "adjOpen")
    public float adjOpen;

    @ColumnInfo(name = "adjVolume")
    public int adjVolume;

    @ColumnInfo(name = "divCash")
    public float divCash;

    @ColumnInfo(name = "splitFactor")
    public float splitFactor;

    @ColumnInfo(name = "marketcap")
    public int marketCap;

    @ColumnInfo(name = "enterprise_val")
    public double enterpriseVal;

    @ColumnInfo(name = "peRatio")
    public double peRatio;

    @ColumnInfo(name = "pbRatio")
    public double pbRatio;

    @ColumnInfo(name = "trailingPEG1Y")
    public double trailingPEG1Y;

    public int getHash() {
        return hash;
    }

    public void setHash(int hash) {
        this.hash = hash;
    }
    public float getAdjClose() {
        return adjClose;
    }

    public void setAdjClose(float adjClose) {
        this.adjClose = adjClose;
    }

    public float getAdjHigh() {
        return adjHigh;
    }

    public void setAdjHigh(float adjHigh) {
        this.adjHigh = adjHigh;
    }

    public float getAdjLow() {
        return adjLow;
    }

    public void setAdjLow(float adjLow) {
        this.adjLow = adjLow;
    }

    public float getAdjOpen() {
        return adjOpen;
    }

    public void setAdjOpen(float adjOpen) {
        this.adjOpen = adjOpen;
    }

    public float getAdjVolume() {
        return adjVolume;
    }

    public void setAdjVolume(int adjVolume) {
        this.adjVolume = adjVolume;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public float getDivCash() {
        return divCash;
    }

    public void setDivCash(float divCash) {
        this.divCash = divCash;
    }

    public double getHigh() {
        return high;
    }

    public void setHigh(double high) {
        this.high = high;
    }

    public double getLow() {
        return low;
    }

    public void setLow(double low) {
        this.low = low;
    }

    public double getOpen() {
        return open;
    }

    public void setOpen(double open) {
        this.open = open;
    }

    public float getSplitFactor() {
        return splitFactor;
    }

    public void setSplitFactor(float splitFactor) {
        this.splitFactor = splitFactor;
    }

    public int getVolume() {
        return volume;
    }

    public void setVolume(int volume) {
        this.volume = volume;
    }

    public String getTicker() {
        return ticker;
    }

    public void setTicker(String ticker) {
        this.ticker = ticker;
    }

    public double getClose(){
        return close;
    }

    public void setClose(double close){
        this.close = close;
    }

    public void setMarketCap(int marketCap) {
        this.marketCap = marketCap;
    }

    public double getMarketCap(){
        return marketCap;
    }

    public void setEnterpriseVal(double enterpriseVal) {
        this.enterpriseVal = enterpriseVal;
    }

    public double getPeRatio() {
        return peRatio;
    }

    public void setPeRatio(double peRatio) {
        this.peRatio = peRatio;
    }

    public double getPbRatio() {
        return pbRatio;
    }

    public void setPbRatio(double pbRatio) {
        this.pbRatio = pbRatio;
    }

    public double getTrailingPEG1Y() {
        return trailingPEG1Y;
    }

    public void setTrailingPEG1Y(double trailingPEG1Y) {
        this.trailingPEG1Y = trailingPEG1Y;
    }


    public StockDetails( int id, int hash, String date, double close, double high, double low,
                         double open, int volume, float adjClose, float adjHigh, float adjLow, float adjOpen,
                         int adjVolume, float divCash, float splitFactor, String ticker, int marketCap,
                         double enterpriseVal, double peRatio, double pbRatio, double trailingPEG1Y) {
        this.hash = hash;
        this.id = id;
        this.date = date;
        this.close = close;
        this.high = high;
        this.low = low;
        this.open = open;
        this.volume = volume;
        this.adjClose = adjClose;
        this.adjHigh = adjHigh;
        this.adjLow = adjLow;
        this.adjOpen = adjOpen;
        this.adjVolume = adjVolume;
        this.divCash = divCash;
        this.splitFactor = splitFactor;
        this.ticker = ticker;
        this.marketCap = marketCap;
        this.enterpriseVal = enterpriseVal;
        this.peRatio = peRatio;
        this.pbRatio = pbRatio;
        this.trailingPEG1Y = trailingPEG1Y;
    }


}