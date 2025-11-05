import org.junit.Test;
import static org.junit.Assert.*;

public class BasicCalculationsTest {
    @Test
    public void TestDivisionByZero(){
        BasicCalculations testDivisionByZero = new BasicCalculations();
        
        // assertThrows expects the exception type and a lambda/executable
        assertThrows(ArithmeticException.class, () -> {
            testDivisionByZero.PerfectDivision(20, 0);
        });
    }
}
