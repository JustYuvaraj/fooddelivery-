# Environment Configuration Guide

## Database Password Security

The database password has been moved to environment variables for security. Follow these steps to configure:

### Option 1: Environment Variables (Recommended)

Set the following environment variables before starting the application:

**Windows (PowerShell):**
```powershell
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_password_here"
```

**Windows (Command Prompt):**
```cmd
set DB_USERNAME=postgres
set DB_PASSWORD=your_password_here
```

**Linux/Mac:**
```bash
export DB_USERNAME=postgres
export DB_PASSWORD=your_password_here
```

### Option 2: Application Properties File

Create a `application-local.yml` file in `src/main/resources/` (this file should be in `.gitignore`):

```yaml
spring:
  datasource:
    username: postgres
    password: your_password_here
```

Then run with profile:
```bash
java -jar -Dspring.profiles.active=local your-app.jar
```

### Option 3: IDE Configuration

In IntelliJ IDEA or Eclipse, configure environment variables in the run configuration:
- **IntelliJ IDEA**: Run → Edit Configurations → Environment Variables
- **Eclipse**: Run → Run Configurations → Environment

Add:
- `DB_USERNAME=postgres`
- `DB_PASSWORD=your_password_here`

## Default Values

If environment variables are not set, the application will use:
- `DB_USERNAME`: `postgres` (default)
- `DB_PASSWORD`: empty string (will cause connection error - must be set)

## Security Best Practices

1. **Never commit passwords to version control**
2. **Use environment variables** for sensitive configuration
3. **Use secrets management** (AWS Secrets Manager, HashiCorp Vault) in production
4. **Rotate passwords regularly**
5. **Use different passwords** for development, staging, and production

## Verification

After setting the environment variables, restart the application and verify the database connection is successful.

