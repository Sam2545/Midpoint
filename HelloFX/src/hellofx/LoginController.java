package hellofx;

import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.stage.Stage;

public class LoginController {

    @FXML
    private TextField usernameField;

    @FXML
    private PasswordField passwordField;

    @FXML
    private Button loginButton;

    @FXML
    private Button cancelButton;

    @FXML
    private Hyperlink forgotPasswordLink;

    @FXML
    private Hyperlink signUpLink;

    @FXML
    private void initialize() {
        // Set up button actions
        loginButton.setOnAction(e -> handleLogin());
        cancelButton.setOnAction(e -> handleCancel());
        forgotPasswordLink.setOnAction(e -> handleForgotPassword());
        signUpLink.setOnAction(e -> handleSignUp());
    }

    private void handleLogin() {
        String username = usernameField.getText();
        String password = passwordField.getText();
        
        // Simple validation (non-functional as requested)
        if (username.isEmpty() || password.isEmpty()) {
            showAlert("Login Error", "Please enter both username and password.");
        } else {
            showAlert("Login Successful", "Welcome, " + username + "!");
            // In a real app, you would navigate to the next screen here
            navigateToLocationScreen();
        }
    }

    private void handleCancel() {
        usernameField.clear();
        passwordField.clear();
    }

    private void handleForgotPassword() {
        showAlert("Forgot Password", "Password reset functionality would be implemented here.");
    }

    private void handleSignUp() {
        showAlert("Sign Up", "User registration functionality would be implemented here.");
    }

    private void navigateToLocationScreen() {
        try {
            // Close current window and open location screen
            Stage currentStage = (Stage) loginButton.getScene().getWindow();
            currentStage.close();
            
            // Open location screen
            Main.switchToLocationScreen();
        } catch (Exception e) {
            showAlert("Error", "Failed to navigate to location screen.");
        }
    }

    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
}
