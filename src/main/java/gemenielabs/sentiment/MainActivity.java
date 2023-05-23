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



public class MainActivity extends AppCompatActivity{

    public static StockDao stockDao;
    public static Boolean blockingActionBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        StockDatabase db = Room.databaseBuilder(getApplicationContext(), StockDatabase.class, "stocksdatabase").build();
        stockDao = db.stockDao();
        Toolbar myToolbar = findViewById(R.id.my_toolbar);
        myToolbar.setTitleTextColor(this.getColor(R.color.white));
        setSupportActionBar(myToolbar);
        blockingActionBar = false;
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.main, menu);
        return true;
    }

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