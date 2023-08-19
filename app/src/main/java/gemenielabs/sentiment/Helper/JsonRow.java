package gemenielabs.sentiment.Helper;

import com.google.gson.annotations.SerializedName;

public class JsonRow {

    @SerializedName(value = "close")
    double[] close;

    @SerializedName(value = "volume")
    double[] volume;

    @SerializedName(value = "positive")
    double[] positive;

    @SerializedName(value = "negative")
    double[] negative;

    @SerializedName(value = "sentiment")
    double[] sentiment;

    @SerializedName(value = "ticker")
    String ticker;



    public String getTicker() {
        return ticker;
    }

    public void setTicker(String ticker) {
        this.ticker = ticker;
    }

    public JsonRow(double[] close, double[] volume, double[] positive, double[] negative, double[] sentiment, String ticker) {
        this.close = close;
        this.volume = volume;
        this.positive = positive;
        this.negative = negative;
        this.sentiment = sentiment;
        this.ticker = ticker;
    }

    public double[] getClose() {
        return close;
    }

    public void setClose(double[] close) {
        this.close = close;
    }

    public double[] getVolume() {
        return volume;
    }

    public void setVolume(double[] volume) {
        this.volume = volume;
    }

    public double[] getPositive() {
        return positive;
    }

    public void setPositive(double[] positive) {
        this.positive = positive;
    }

    public double[] getNegative() {
        return negative;
    }

    public void setNegative(double[] negative) {
        this.negative = negative;
    }

    public double[] getSentiment() {
        return sentiment;
    }

    public void setSentiment(double[] sentiment) {
        this.sentiment = sentiment;
    }
}