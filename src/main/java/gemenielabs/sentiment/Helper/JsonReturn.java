package gemenielabs.sentiment.Helper;

public class JsonReturn{
    public String month;
    public String week;
    public String next;
    public String ticker;
    public String[] positive;
    public String[] neutral;
    public String[] negative;

    public void setHash(String hash) {
        this.hash = hash;
    }

    public String hash;

    public String getFail() {
        return fail;
    }

    public void setFail(String fail) {
        this.fail = fail;
    }

    public String fail;


    public String getHash() {
        return hash;
    }
    public String getMonth() {
        return month;
    }

    public String getWeek() {
        return week;
    }

    public String getNext() {
        return next;
    }

    public String getTicker() {return ticker;}

    public String[] getPositive() {return positive;}

    public String[] getNeutral() {return neutral;}

    public String[] getNegative() {return negative;}

}
