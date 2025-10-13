package hellofx;

import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.stage.Stage;

public class LocationController {

    @FXML
    private TextField startLocationField;

    @FXML
    private TextField endLocationField;

    @FXML
    private Button findRouteButton;

    @FXML
    private Button clearButton;

    @FXML
    private Label statusLabel;

    @FXML
    private Button backToLoginButton;

    @FXML
    private void initialize() {
        // Set up button actions
        findRouteButton.setOnAction(e -> handleFindRoute());
        clearButton.setOnAction(e -> handleClear());
        backToLoginButton.setOnAction(e -> handleBackToLogin());
        
        // Initialize status label
        statusLabel.setText("Ready to find your route!");
    }

    private void handleFindRoute() {
        String startLocation = startLocationField.getText().trim();
        String endLocation = endLocationField.getText().trim();
        
        // Simple validation (non-functional as requested)
        if (startLocation.isEmpty() || endLocation.isEmpty()) {
            statusLabel.setText("Please enter both starting location and destination.");
            statusLabel.setStyle("-fx-text-fill: #FF6B35; -fx-font-weight: bold;");
        } else {
            statusLabel.setText("Finding route from " + startLocation + " to " + endLocation + "...");
            statusLabel.setStyle("-fx-text-fill: #2E86AB; -fx-font-weight: bold;");
            
            // Simulate processing (non-functional as requested)
            showAlert("Route Found", 
                "Route from " + startLocation + " to " + endLocation + 
                "\n\nIn a real application, this would show:\n" +
                "• Distance: 1234.5 miles\n" +
                "• Estimated time: 2 days 3 hours\n" +
                "• Route details and turn-by-turn directions");
        }
    }

    private void handleClear() {
        startLocationField.clear();
        endLocationField.clear();
        statusLabel.setText("Fields cleared. Ready to find your route!");
        statusLabel.setStyle("-fx-text-fill: #2E86AB; -fx-font-weight: normal;");
    }

    private void handleBackToLogin() {
        showAlert("Back to Login", "Would navigate back to login screen here.");
    }

    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
}
