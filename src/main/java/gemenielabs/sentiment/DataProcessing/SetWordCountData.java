package gemenielabs.sentiment.DataProcessing;

import static java.lang.Boolean.FALSE;
import static java.lang.Boolean.TRUE;
import static gemenielabs.sentiment.Fragments.SearchFragment.client;
import static gemenielabs.sentiment.MainActivity.stockDao;

import android.content.Context;
import android.util.Log;

import com.google.gson.Gson;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import java.net.SocketTimeoutException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import gemenielabs.sentiment.Helper.JsonReturn;
import gemenielabs.sentiment.Helper.JsonSend;
import gemenielabs.sentiment.R;
import gemenielabs.sentiment.Room.NewsDetails;
import gemenielabs.sentiment.Room.WordCountDetails;
import okhttp3.MediaType;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class SetWordCountData {

    public static final MediaType JSON = MediaType.parse("application/json");
    private static final String FAIL = "fail";

    public class SetWordCountData {

        // Define media type and fail string as constants
        private static final MediaType JSON = MediaType.parse("application/json");
        private static final String FAIL = "fail";
    
        // Refactored setWordCountData function
        public List<WordCountDetails> setWordCountData(String ticker, List<NewsDetails> list, Context context) {
            Log.i("TAG_start  ", "SETWordCountData_START");
            Log.i("TAG_SetWordCount_list_size: ", String.valueOf(list.size()));
            ArrayList<CompletableFuture<String[]>> articles = new ArrayList<>();
    
            // Check if list is not empty
            if (!list.isEmpty()) {
                Log.i("TAG_SetWordCount_start_NewSentiment:   ", "Start");
    
                ArrayList<CompletableFuture<String>> results = new ArrayList<>();
    
                // Loop through the list and add articles to CompletableFuture list
                for (NewsDetails news : list) {
                    String newsArticleDate = news.getDate();
                    String url = news.getAddress();
                    Log.i("TAG_setWordCount_newsArticleDate:  ", newsArticleDate);
                    articles.add(CompletableFuture.supplyAsync(() -> getArticleBody(url, newsArticleDate)));
                }
    
                // Wait for all articles to be added to the CompletableFuture list
                CompletableFuture.allOf(articles.toArray(new CompletableFuture[0])).join();
    
                HashMap<String, String[]> Hash_Article_Date = new HashMap<>();
                int SpeedDisMuthaUp = 0;
    
                // Loop through the articles and get their sentiment
                for (CompletableFuture<String[]> future : articles) {
                    String[] body = new String[0];
                    try {
                        body = future.get();
                    } catch (ExecutionException | InterruptedException e) {
                        e.printStackTrace();
                    }
                    String replaceNumbers = body[0].replaceAll("-*\\+*\\d*.\\d*%", "");
                    Log.i("TAG_setWordCount_replaceNumbers_string:  ", replaceNumbers);
                    int hash = replaceNumbers.hashCode();
                    WordCountDetails isHere = stockDao.getSingleHashedWordCountDetails(ticker, hash);
                    if (isHere != null && !isHere.getSentiment().equals(FAIL)) {
                        continue;
                    }
                    if (!body[0].equals(FAIL) && SpeedDisMuthaUp < 8) {
                        Hash_Article_Date.put(String.valueOf(hash), body);
                        SpeedDisMuthaUp++;
                    }
                }
    
                // Loop through the articles and get their sentiment
                for (String key : Hash_Article_Date.keySet()) {
                    String[] bodyWithHash = {key, Hash_Article_Date.get(key)[0]};
                    results.add(CompletableFuture.supplyAsync(() -> getSentiment(bodyWithHash)));
                }
    
                // Wait for all sentiments to be added to the CompletableFuture list
                CompletableFuture.allOf(results.toArray(new CompletableFuture[0])).join();
    
                // Loop through the results and insert them into the database
                for (CompletableFuture<String> future : results) {
                    String returns = null;
                    try {
                        returns = future.get();
                    } catch (ExecutionException | InterruptedException e) {
                        e.printStackTrace();
                    }
                    WordCountDetails wordCountDetails = new WordCountDetails(" ", 0, " ",
                            0, 0, 0, 0, 0, "",
                            "", 0);
                    String[] resultsString = returns.split(" ");
    
                    String body = Hash_Article_Date.get(resultsString[0])[0];
                    String date = Hash_Article_Date.get(resultsString[0])[1];
                    if (resultsString[1].equals(FAIL)) {
                        wordCountDetails.setSentiment(FAIL);
                        wordCountDetails.setDate(date);
                        wordCountDetails.setBody(body);
                        wordCountDetails.setHash(Integer.valueOf(resultsString[0]));
                        stockDao.insertWordCountContent(wordCountDetails);
                        continue;
                    }
    
                    int[] words = recordWordCounts(context, body);
                    wordCountDetails.setSentiment(resultsString[1]);
                    wordCountDetails.setSentimentNumber(Double.parseDouble(resultsString[2]));
                    wordCountDetails.setDate(date.substring(0, 10));
                    wordCountDetails.setTicker(ticker);
                    wordCountDetails.setHash(Integer.valueOf(resultsString[0]));
                    double next = createPercentageGainLoss(ticker, date, 0);
                    double wks = createPercentageGainLoss(ticker, date, 14);
                    double mnth = createPercentageGainLoss(ticker, date, 28);
                    wordCountDetails.setNextDay(next);
                    wordCountDetails.setTwoWks(wks);
                    wordCountDetails.setOneMnth(mnth);
                    wordCountDetails.setBody(body);
                    wordCountDetails.setPositive(words[0]);
                    wordCountDetails.setNegative(words[1]);
    
                    stockDao.insertWordCountContent(wordCountDetails);
                }
            }
    
            // Get word count details from the database
            List<WordCountDetails> wordCountDetailsList = stockDao.getWordCountDetails(ticker);
    
            // If the list is empty, create a no news word count detail and add it to the database
            if (wordCountDetailsList.isEmpty()) {
                createNoNewsWordCountDetail(ticker);
                wordCountDetailsList = stockDao.getWordCountDetails(ticker);
            }
    
            return wordCountDetailsList;
        }
    
        // Refactored getArticleBody function
        public String[] getArticleBody(String url, String date) {
            String[] body = {"", date};
            try {
                Request request = new Request.Builder()
                        .url(url)
                        .get()
                        .build();
                Response response = client.newCall(request).execute();
                Document doc = Jsoup.parse(Objects.requireNonNull(response.body()).string());
                body[0] = Objects.requireNonNull(doc.getElementById("js-article__body")).text();
            } catch (Exception e) {
                e.printStackTrace();
                Log.i("TAG_setWordCount_getArticleBody_Successful:  ", "FALSE");
                body[0] = FAIL;
            }
            return body;
        }
    
        // Create a no news word count detail and add it to the database
        private void createNoNewsWordCountDetail(String ticker) {
            WordCountDetails wordCountDetails = new WordCountDetails(" ", 0, " ",
                    0, 0, 0, 0, 0, "",
                    "", 0);
            String noNewsData = "No News Data";
            wordCountDetails.setTicker(ticker);
            wordCountDetails.setSentiment(noNewsData);
            wordCountDetails.setHash(noNewsData.hashCode());
            LocalDate date = LocalDate.now();
            wordCountDetails.setDate(date.toString());
            stockDao.insertWordCountContent(wordCountDetails);
        }
    }

    / This function records the count of positive and negative words in a given article body
public int[] recordWordCounts(Context context, String body) {
    // Initialize variables
    String[] positive;
    String[] negative;
    int pos = 0;
    int neg = 0;
    // Split the article body into an array of words
    String[] articleBody = body.split(" ");
    // Sort the array of words
    Arrays.sort(articleBody);
    // Initialize a holder variable to keep track of the first letter of the current word
    String holder = "a";
    // Loop through each word in the sorted array
    for (String word : articleBody) {
        // Convert the word to lowercase and remove any non-alphabetic characters
        String lowerWord = word.toLowerCase().replaceAll("[^a-zA-Z]", "");
        // Check if the length of the word is greater than 1
        if (lowerWord.length() > 1) {
            // Get the first letter of the word
            String firstLetter = lowerWord.substring(0, 1);
            // Check if the first letter is different from the previous word's first letter
            if (!firstLetter.equals(holder)) {
                // Update the positive and negative word arrays based on the current first letter
                String alphabet = "abcdefghijklmnopqrstuvwxyz";
                positive = context.getResources().getStringArray(R.array.positive_words_a);
                negative = context.getResources().getStringArray(R.array.positive_words_a);
                positive = context.getResources().getStringArray(positive_word_ids[alphabet.indexOf(holder)]);
                negative = context.getResources().getStringArray(negative_word_ids[alphabet.indexOf(holder)]);
                holder = firstLetter;
            }
            // Loop through each positive word and increment the count if the word is found
            for (String po : positive) {
                if (po.equals(lowerWord)) {
                    pos++;
                }
            }
            // Loop through each negative word and increment the count if the word is found
            for (String n : negative) {
                if (n.equals(lowerWord)) {
                    neg++;
                }
            }
        }
    }
    // Return an array containing the count of positive and negative words
    return new int[]{pos, neg};
}

// This function calculates the percentage gain or loss of a stock based on its closing price on two different dates
public double createPercentageGainLoss(String ticker, String date, int time) {
    // Initialize variables
    LocalDate dateGain = LocalDate.parse(date);
    dateGain = dateGain.plusDays(time);
    boolean naPrevent = false;
    // Loop through the next 5 days to find a valid stock price
    for (int j = 0; j < 5; j++) {
        dateGain = dateGain.plusDays(1);
        // Check if a valid stock price is found
        if (stockDao.getSingleStock(ticker, dateGain.toString()) != null) {
            naPrevent = true;
            break;
        } else if (j == 4) {
            // Return 0 if a valid stock price is not found after 5 days
            return 0;
        }
    }
    // Calculate the change in closing price
    double change = stockDao.getSingleStock(ticker, dateGain.toString()).getClose() -
            stockDao.getSingleStock(ticker, date).getClose();
    // Calculate the percentage change in closing price
    double finalChange = change / stockDao.getSingleStock(ticker, dateGain.toString()).getClose();
    // To prevent N/A for 0.0 final change on close @ the same price two days in a row
    if (naPrevent && (finalChange == 0.0)) {
        finalChange = 0.00001;
    }
    // Return the percentage change in closing price
    return finalChange;
}

// This function analyzes the sentiment of a given article body
public String getSentiment(String[] body) {
    // Remove any unwanted characters from the article body
    String alpha = body[1].replaceAll("\"", "").replaceAll("'", "")
            .replaceAll(",", "").replaceAll("’", "");
    // Split the article body into an array of sentences
    String[] alphaSplit = alpha.split("(?<!\\w\\.\\w.)(?<!([A-Z][a-z])\\{{30,\\}}\\.)(?<=[.?])\\s");
    // Create a JSON object containing the article sentences and a hash string
    String hashString = body[0];
    JsonSend sourceArray = new JsonSend(alphaSplit, hashString);
    String jString = new Gson().toJson(sourceArray);
    Log.i("TAG_SetWordCountData_jString:  ", jString);
    String url = "https://stocks-backend-sentiment-f3jmjyxrpq-uc.a.run.app";
    String prediction = "";
    try {
        // Send a POST request to the sentiment analysis API with the JSON object
        RequestBody r_body = RequestBody.create(JSON, jString);
        Request request = new Request.Builder()
                .url(url)
                .post(r_body)
                .build();
        Log.i("TAG_setWordCount_Request:  ", request.toString());
        Response response = client.newCall(request).execute();
        String bodyOfResponse = response.body().string();
        // Convert the API response to a JSON object and extract the sentiment prediction
        prediction = convertToList(new Gson().fromJson(bodyOfResponse, JsonReturn.class));
        response.close();
    } catch (SocketTimeoutException e) {
        // Return a failure message if the request times out
        return hashString + " " + FAIL + " " + body[1];
    } catch (Exception e) {
        e.printStackTrace();
        Log.i("TAG_setWordCount_getSentiment_catch_block  ", "FAIL");
        // Return a failure message if an exception is caught
        return hashString + " " + FAIL + " " + body[1];
    }
    // Return the sentiment prediction
    return prediction;
}

// This function converts the sentiment prediction JSON object into a string
public String convertToList(JsonReturn prediction) {
    // Extract the count and label of positive, neutral, and negative sentiments
    String[] positive = prediction.getPositive();
    String[] neutral = prediction.getNeutral();
    String[] negative = prediction.getNegative();
    String returnString;
    // Determine the overall sentiment based on the counts of positive, neutral, and negative sentiments
    if (Integer.parseInt(positive[0]) > Integer.parseInt(neutral[0]) && Integer.parseInt(positive[0]) > Integer.parseInt(negative[0])) {
        returnString = String.format("Positive %s", positive[1]);
    } else if (Integer.parseInt(neutral[0]) > Integer.parseInt(negative[0])) {
        returnString = String.format("Neutral %s", neutral[1]);
    } else {
        returnString = String.format("Negative %s", negative[1]);
    }
    Log.i("TAG_setWordCountData_prediction:   ", returnString);
    // Return the sentiment prediction as a string
    return prediction.getHash() + " " + returnString;
}

    int[] positive_word_ids = {
            R.array.positive_words_a,
            R.array.positive_words_b,
            R.array.positive_words_c,
            R.array.positive_words_d,
            R.array.positive_words_e,
            R.array.positive_words_f,
            R.array.positive_words_g,
            R.array.positive_words_h,
            R.array.positive_words_i,
            R.array.positive_words_j,
            R.array.positive_words_k,
            R.array.positive_words_l,
            R.array.positive_words_m,
            R.array.positive_words_n,
            R.array.positive_words_o,
            R.array.positive_words_p,
            R.array.positive_words_q,
            R.array.positive_words_r,
            R.array.positive_words_s,
            R.array.positive_words_t,
            R.array.positive_words_u,
            R.array.positive_words_v,
            R.array.positive_words_w,
            R.array.positive_words_x,
            R.array.positive_words_y,
            R.array.positive_words_z};

    int[] negative_word_ids = {
            R.array.negative_words_a,
            R.array.negative_words_b,
            R.array.negative_words_c,
            R.array.negative_words_d,
            R.array.negative_words_e,
            R.array.negative_words_f,
            R.array.negative_words_g,
            R.array.negative_words_h,
            R.array.negative_words_i,
            R.array.negative_words_j,
            R.array.negative_words_k,
            R.array.negative_words_l,
            R.array.negative_words_m,
            R.array.negative_words_n,
            R.array.negative_words_o,
            R.array.negative_words_p,
            R.array.negative_words_q,
            R.array.negative_words_r,
            R.array.negative_words_s,
            R.array.negative_words_t,
            R.array.negative_words_u,
            R.array.negative_words_v,
            R.array.negative_words_w,
            R.array.negative_words_x,
            R.array.negative_words_y,
            R.array.negative_words_z};

}
