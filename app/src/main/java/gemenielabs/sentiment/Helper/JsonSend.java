package gemenielabs.sentiment.Helper;

import com.google.gson.annotations.SerializedName;

public class JsonSend {

    @SerializedName(value = "text")
    private String[] text;

    @SerializedName(value = "hash")
    private String hash;

    public String getHash() {return hash;}
    public void setHash(String hash) {this.hash = hash;}

    public String[] getText() {
        return text;
    }
    public void setText(String[] text) {
        this.text = text;
    }

    public JsonSend(String[] text, String hash) {
        this.text = text;
        this.hash = hash;
    }
}
