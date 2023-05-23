package gemenielabs.sentiment.DataProcessing;

import static gemenielabs.sentiment.MainActivity.stockDao;

import android.util.Log;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import gemenielabs.sentiment.Room.CombinedWordDetails;
import gemenielabs.sentiment.Room.WordCountDetails;

public class SetCombineWordCountData {

    public List<CombinedWordDetails> combineDates(List<WordCountDetails> wordCountDetails) {
        CombinedWordDetails combo = new CombinedWordDetails(" ", " ", 0, 0,
                0, " ", 0, 0, 0, "");
        ArrayList<String> holderDates = new ArrayList<>();
        List<CombinedWordDetails> combinedWordDetails = null;
        Log.i("TAG_start", "SetcombineWordCountData");
        if (wordCountDetails.size() > 0) {
            combinedWordDetails = stockDao.getCombinedWordDetails(wordCountDetails.get(0).getTicker());
            ArrayList<String> dates = new ArrayList<>();
            for(CombinedWordDetails details: combinedWordDetails){
                dates.add(details.getDate());
            }

            for (int i = 0; i < wordCountDetails.size(); i++) {

                String date = wordCountDetails.get(i).getDate();
                Log.i("TAG_setCombineWordCountData_newsMostRecentDate   ", date);
                if (holderDates.contains(date) || dates.contains(date)) {
                    continue;
                }
                double possentiment = 0;
                double neutsentiment = 0;
                double negsentiment = 0;
                int posnumberOfArticles = 0;
                int neutnumberOfArticles = 0;
                int negnumberOfArticles = 0;
                int poswords = 0;
                int negwords = 0;

                for (int j = 0; j < wordCountDetails.size(); j++) {
                    String date1 = wordCountDetails.get(j).getDate();

                    if (date.equals(date1) && i != j) {
                        String sentString = wordCountDetails.get(j).getSentiment();
                        if (sentString.equals("Positive")) {
                            possentiment += wordCountDetails.get(j).getSentimentNumber();
                            posnumberOfArticles += 1;
                        } else if (sentString.equals("Neutral")) {
                            neutsentiment += wordCountDetails.get(j).getSentimentNumber();
                            neutnumberOfArticles += 1;
                        } else {
                            negsentiment += wordCountDetails.get(j).getSentimentNumber();
                            negnumberOfArticles += 1;
                        }
                        poswords += wordCountDetails.get(j).getPositive();
                        negwords += wordCountDetails.get(j).getNegative();
                    }
                }
                //Ex. If you have 4 dates you have to add the date here or the loop starts at 2 and adds up 3&4 ect
                holderDates.add(date);
                String sentString = wordCountDetails.get(i).getSentiment();
                poswords += wordCountDetails.get(i).getPositive();
                negwords += wordCountDetails.get(i).getNegative();
                if (sentString.equals("Positive")) {
                    possentiment += wordCountDetails.get(i).getSentimentNumber();
                    posnumberOfArticles += 1;
                }
                if (sentString.equals("Neutral")) {
                    neutsentiment += wordCountDetails.get(i).getSentimentNumber();
                    neutnumberOfArticles += 1;
                }
                if (sentString.equals("Negative")) {
                    negsentiment += wordCountDetails.get(i).getSentimentNumber();
                    negnumberOfArticles += 1;
                }
                if (posnumberOfArticles > 1) {
                    possentiment = possentiment / posnumberOfArticles;
                }
                if (neutnumberOfArticles > 1) {
                    neutsentiment = neutsentiment / neutnumberOfArticles;
                }
                if (negnumberOfArticles > 1) {
                    negsentiment = negsentiment / negnumberOfArticles;
                }
                Log.i("TAG_setCombineWordCountData_setSentiment:   ", "    pos " + posnumberOfArticles + "  " + possentiment +
                        "  neut " + neutnumberOfArticles + "  "+  neutsentiment + "  neg  " + negnumberOfArticles + "  " + negsentiment);

                if (possentiment > negsentiment && possentiment > neutsentiment) {
                    combo.setSentiment("POS");
                } else if (neutsentiment > negsentiment) {
                    combo.setSentiment("NEUT");
                    possentiment = neutsentiment;
                } else {
                    combo.setSentiment("NEG");
                    possentiment = negsentiment;
                }
                if (posnumberOfArticles > neutnumberOfArticles && posnumberOfArticles > negnumberOfArticles) {
                    combo.setSentiment("POS");
                }
                if (neutnumberOfArticles > negnumberOfArticles && neutnumberOfArticles > posnumberOfArticles) {
                    combo.setSentiment("NEUT");
                    possentiment = neutsentiment;
                }
                if (negnumberOfArticles > neutnumberOfArticles && negnumberOfArticles > posnumberOfArticles) {
                    combo.setSentiment("NEG");
                    possentiment = negsentiment;
                }

                if(sentString.equals("No News Data")){
                    combo.setSentiment("No News Data");
                }
                combo.setPositive(poswords);
                combo.setNegative(negwords);
                combo.setDate(date);
                combo.setNextDay(wordCountDetails.get(i).getNextDay());
                combo.setTwoWks(wordCountDetails.get(i).getTwoWks());
                combo.setOneMnth(wordCountDetails.get(i).getOneMnth());
                combo.setTicker(wordCountDetails.get(0).getTicker());
                combo.setSentimentNumber(possentiment);

                combo.setUpdateDate(LocalDate.now().toString());
                stockDao.insertCombinedWordDetails(combo);
                }
                combinedWordDetails = stockDao.getCombinedWordDetails(wordCountDetails.get(0).getTicker());

            }

        return combinedWordDetails;
        }


    }
