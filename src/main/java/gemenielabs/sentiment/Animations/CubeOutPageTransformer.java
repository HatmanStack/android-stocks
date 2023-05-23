package gemenielabs.sentiment.Animations;

import android.view.View;

import androidx.annotation.NonNull;

import androidx.viewpager2.widget.ViewPager2;

public class CubeOutPageTransformer implements ViewPager2.PageTransformer {


    @Override
    public void transformPage(@NonNull View page, float position) {
        page.setPivotX( position < 0f ? page.getWidth() : 0f );
        page.setPivotY(page.getHeight() * 0.5f);
        page.setRotation(90f * position);
    }
}
