package hellofx;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

public class Main extends Application {

    @Override
    public void start(Stage primaryStage) throws Exception{
        // Load the login screen by default
        Parent root = FXMLLoader.load(getClass().getResource("LoginScreen.fxml"));
        primaryStage.setTitle("Login - Location Finder App");
        primaryStage.setScene(new Scene(root, 600, 500));
        primaryStage.setResizable(false); // Keep window size fixed for better UI
        primaryStage.show();
    }

    // Method to switch to location screen (can be called from login controller)
    public static void switchToLocationScreen() throws Exception {
        Stage locationStage = new Stage();
        Parent root = FXMLLoader.load(Main.class.getResource("LocationScreen.fxml"));
        locationStage.setTitle("Location Finder");
        locationStage.setScene(new Scene(root, 600, 500));
        locationStage.setResizable(false);
        locationStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}