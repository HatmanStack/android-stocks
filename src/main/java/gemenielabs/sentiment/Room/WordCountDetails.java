package gemenielabs.sentiment.Room;

import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "word_count_details")
public class WordCountDetails {
    @PrimaryKey(autoGenerate = true)
    public int id;

    @ColumnInfo(name = "date")
    public String date;

    public int getHash() {
        return hash;
    }

    public void setHash(int hash) {
        this.hash = hash;
    }

    @ColumnInfo(name = "hash")
    public int hash;

    @ColumnInfo(name = "ticker")
    public String ticker;

    @ColumnInfo(name = "positive")
    public int positive;

    @ColumnInfo(name = "negative")
    public int negative;

    @ColumnInfo(name = "next_day")
    public double nextDay;

    @ColumnInfo(name = "two_weeks")
    public double twoWks;

    @ColumnInfo(name = "one_month")
    public double oneMnth;

    @ColumnInfo(name = "body")
    public String body;

    @ColumnInfo(name = "sentiment")
    public String sentiment;

    @ColumnInfo(name = "sentiment_number")
    public double sentimentNumber;

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

    public double getNextDay() {
        return nextDay;
    }

    public void setNextDay(double nextDay) {
        this.nextDay = nextDay;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getSentiment() {
        return sentiment;
    }

    public void setSentiment(String sentiment) {
        this.sentiment = sentiment;
    }

    public double getTwoWks() {
        return twoWks;
    }

    public void setTwoWks(double twoWks) {
        this.twoWks = twoWks;
    }

    public double getSentimentNumber() {
        return sentimentNumber;
    }

    public void setSentimentNumber(double sentimentNumber) {
        this.sentimentNumber = sentimentNumber;
    }

    public double getOneMnth() {
        return oneMnth;
    }

    public void setOneMnth(double oneMnth) {
        this.oneMnth = oneMnth;
    }

    public WordCountDetails(String date, int hash, String ticker, int positive, int negative,
                            double nextDay, double twoWks, double oneMnth, String body,
                            String sentiment, double sentimentNumber) {

        this.hash = hash;
        this.date = date;
        this.ticker = ticker;
        this.positive = positive;
        this.negative = negative;
        this.nextDay = nextDay;
        this.twoWks = twoWks;
        this.oneMnth = oneMnth;
        this.body = body;
        this.sentiment = sentiment;
        this.sentimentNumber = sentimentNumber;
    }

}