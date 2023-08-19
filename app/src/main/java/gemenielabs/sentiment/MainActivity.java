package gemenielabs.sentiment;

import android.os.Bundle;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.fragment.app.FragmentManager;
import androidx.room.Room;

import gemenielabs.sentiment.Fragments.MainHostFragment;
import gemenielabs.sentiment.Fragments.PortfolioFragment;
import gemenielabs.sentiment.Fragments.StockHostFragment;
import gemenielabs.sentiment.Room.StockDao;
import gemenielabs.sentiment.Room.StockDatabase;



/**
 * This class represents the main activity of the application.
 * It initializes the database and sets up the action bar.
 */
public class MainActivity extends AppCompatActivity {

    public static StockDao stockDao; // Data access object for stocks
    public static Boolean blockingActionBar; // Flag to block action bar

    /**
     * This method is called when the activity is created.
     * It initializes the database, sets up the action bar and initializes the blockingActionBar flag.
     * @param savedInstanceState The saved instance state of the activity
     */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize the database
        StockDatabase db = Room.databaseBuilder(getApplicationContext(), StockDatabase.class, "stocksdatabase").build();
        stockDao = db.stockDao();

        // Set up the action bar
        Toolbar myToolbar = findViewById(R.id.my_toolbar);
        myToolbar.setTitleTextColor(this.getColor(R.color.white));
        setSupportActionBar(myToolbar);

        // Initialize the blockingActionBar flag
        blockingActionBar = false;
    }

    /**
     * This method is called to create the options menu.
     * @param menu The menu to be created
     * @return true if the menu is created successfully, false otherwise
     */
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.main, menu);
        return true;
    }

    /**
     * This method is called when the back button is pressed.
     * It replaces the current fragment with the MainHostFragment if the blockingActionBar flag is false.
     * Otherwise, it displays a toast message.
     */
    @Override
    public void onBackPressed() {
        if(!blockingActionBar) {
            FragmentManager fragmentManager = getSupportFragmentManager();
            fragmentManager.beginTransaction()
                    .replace(R.id.fragment_container_view, MainHostFragment.class,
                            null).setReorderingAllowed(true).commit();
        }else {
            Toast.makeText(this, "Updating", Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * This method is called when an item in the options menu is selected.
     * It replaces the current fragment with the corresponding fragment based on the selected item.
     * @param item The selected item
     * @return true if the item is selected successfully, false otherwise
     */
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if(blockingActionBar) {
            Toast.makeText(this, "Updating", Toast.LENGTH_SHORT).show();
            return super.onOptionsItemSelected(item);
        }else {
            FragmentManager fragmentManager = getSupportFragmentManager();
            switch (item.getItemId()) {
                case R.id.action_search:
                    fragmentManager.beginTransaction()
                            .replace(R.id.fragment_container_view, MainHostFragment.class,
                                    null).setReorderingAllowed(true).commit();
                    return true;
                case R.id.action_price:
                    fragmentManager.beginTransaction()
                            .replace(R.id.fragment_container_view, StockHostFragment.class,
                                    null).setReorderingAllowed(true).commit();
                    return true;
                case R.id.action_portfolio:
                    fragmentManager.beginTransaction()
                            .replace(R.id.fragment_container_view, PortfolioFragment.class,
                                    null).setReorderingAllowed(true).commit();
                    return true;
                default:
                    return super.onOptionsItemSelected(item);
            }
        }
    }

}