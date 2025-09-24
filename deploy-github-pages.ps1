# deploy-github-pages.ps1
# Script to deploy the web application to GitHub Pages

# Configuration
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoName = "storage-worker-demo" # You can change this to your preferred repository name

# Navigate to project directory
Set-Location $projectPath
Write-Host "Preparing to deploy from: $projectPath" -ForegroundColor Green

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "Using $gitVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Git is not installed or not in PATH. Please install Git from https://git-scm.com/" -ForegroundColor Red
    exit 1
}

# Check if the directory is already a git repository
$isGitRepo = Test-Path -Path (Join-Path -Path $projectPath -ChildPath ".git")
if (-not $isGitRepo) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    
    # Create a .gitignore file
    @"
# System files
.DS_Store
Thumbs.db

# Editor files
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
npm-debug.log*
"@ | Out-File -FilePath (Join-Path -Path $projectPath -ChildPath ".gitignore") -Encoding utf8
    
    # Initial commit
    git add .
    git commit -m "Initial commit: Storage Event and Worker Demo"
}

# Check if GitHub CLI is installed
$ghInstalled = $false
try {
    $ghVersion = gh --version
    Write-Host "Using GitHub CLI: $ghVersion" -ForegroundColor Cyan
    $ghInstalled = $true
} catch {
    Write-Host "GitHub CLI is not installed. You can install it from: https://cli.github.com/" -ForegroundColor Yellow
    Write-Host "We'll proceed with manual instructions instead." -ForegroundColor Yellow
}

# Function to create GitHub repo and push content
function CreateAndPushToGitHub {
    if ($ghInstalled) {
        # Create a new GitHub repository using GitHub CLI
        Write-Host "Creating GitHub repository: $repoName..." -ForegroundColor Yellow
        gh repo create $repoName --public --source=. --remote=origin
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to create repository. Please follow manual instructions." -ForegroundColor Red
            return $false
        }
    } else {
        # Manual instructions for creating a GitHub repository
        Write-Host "Manual GitHub Repository Creation Instructions:" -ForegroundColor Yellow
        Write-Host "1. Go to https://github.com/new" -ForegroundColor Cyan
        Write-Host "2. Enter '$repoName' as the Repository name" -ForegroundColor Cyan
        Write-Host "3. Choose 'Public' visibility" -ForegroundColor Cyan
        Write-Host "4. Click 'Create repository'" -ForegroundColor Cyan
        Write-Host "5. Follow the instructions for 'push an existing repository from the command line'" -ForegroundColor Cyan
        
        $response = Read-Host "Have you created the repository? (y/n)"
        if ($response -ne "y") {
            return $false
        }
        
        $remoteUrl = Read-Host "Please enter the repository URL (e.g., https://github.com/username/$repoName.git)"
        git remote add origin $remoteUrl
    }
    
    # Create and switch to gh-pages branch
    Write-Host "Creating gh-pages branch..." -ForegroundColor Yellow
    git checkout -b gh-pages
    
    # Push to GitHub
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push -u origin gh-pages
    
    return $true
}

# Main deployment process
$success = CreateAndPushToGitHub

if ($success) {
    # Get the username from the remote URL
    $remoteUrl = git remote get-url origin
    $username = ""
    
    if ($remoteUrl -match "github\.com[:/]([^/]+)/") {
        $username = $matches[1]
        $demoUrl = "https://$username.github.io/$repoName/"
        
        Write-Host "`nDeployment successful!" -ForegroundColor Green
        Write-Host "`nYour demo is now live at:" -ForegroundColor Magenta
        Write-Host $demoUrl -ForegroundColor Cyan
        Write-Host "`nIt might take a few minutes for GitHub Pages to build your site." -ForegroundColor Yellow
    } else {
        Write-Host "`nDeployment successful, but couldn't parse the username from remote URL." -ForegroundColor Yellow
        Write-Host "Your demo should be available at: https://your-username.github.io/$repoName/" -ForegroundColor Cyan
    }
    
    # Instructions for future updates
    Write-Host "`nTo update your deployment in the future, run:" -ForegroundColor Green
    Write-Host "git add ." -ForegroundColor Cyan
    Write-Host "git commit -m 'Update demo'" -ForegroundColor Cyan
    Write-Host "git push origin gh-pages" -ForegroundColor Cyan
} else {
    Write-Host "`nDeployment process interrupted or failed." -ForegroundColor Red
}