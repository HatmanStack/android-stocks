package gemenielabs.sentiment.Room;

import androidx.annotation.NonNull;
import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "combined_word_count_details")
public class CombinedWordDetails {

    @PrimaryKey
    @NonNull
    @ColumnInfo(name = "date")
    public String date;

    @ColumnInfo(name = "ticker")
    public String ticker;

    @ColumnInfo(name = "positive")
    public int positive;

    @ColumnInfo(name = "negative")
    public int negative;

    @ColumnInfo(name = "sentimentNumber")
    public double sentimentNumber;

    @ColumnInfo(name = "sentiment")
    public String sentiment;

    @ColumnInfo(name = "next_day")
    public double nextDay;

    @ColumnInfo(name = "two_weeks")
    public double twoWks;

    @ColumnInfo(name = "one_month")
    public double oneMnth;

    @ColumnInfo(name = "update_date")
    public String updateDate;

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTicker() {
        return ticker;
    }

    public void setTicker(String ticker) {
        this.ticker = ticker;
    }

    public int getPositive() {
        return positive;
    }

    public void setPositive(int positive) {
        this.positive = positive;
    }

    public int getNegative() {
        return negative;
    }

    public void setNegative(int negative) {
        this.negative = negative;
    }

    public double getSentimentNumber() {
        return sentimentNumber;
    }

    public void setSentimentNumber(double sentiment) {
        this.sentimentNumber = sentiment;
    }

    public void setSentiment(String sentiment) {
        this.sentiment = sentiment;
    }

    public String getSentiment() {
        return sentiment;
    }

    public double getNextDay() {
        return nextDay;
    }

    public void setNextDay(double nextDay) {
        this.nextDay = nextDay;
    }

    public double getTwoWks() {
        return twoWks;
    }

    public void setTwoWks(double twoWks) {
        this.twoWks = twoWks;
    }

    public double getOneMnth() {
        return oneMnth;
    }

    public String getUpdateDate() {
        return updateDate;
    }

    public void setUpdateDate(String updateDate) {
        this.updateDate = updateDate;
    }

    public void setOneMnth(double oneMnth) {
        this.oneMnth = oneMnth;
    }

    public CombinedWordDetails(String date, String ticker, int positive, int negative,
                               double sentimentNumber, String sentiment, double nextDay,
                               double twoWks, double oneMnth, String updateDate) {
        this.date = date;
        this.ticker = ticker;
        this.positive = positive;
        this.negative = negative;
        this.sentimentNumber = sentimentNumber;
        this.sentiment = sentiment;
        this.nextDay = nextDay;
        this.twoWks = twoWks;
        this.oneMnth = oneMnth;
        this.updateDate = updateDate;
    }



}
