---
title: 'Yum-Commits: A Simple Git Commit Assistant'
description: 'A Rust program that assists users in generating commit messages for their Git repositories'
pubDate: 'Oct 03 2024'
heroImage: '/blog-placeholder-4.jpg'
---
**Yum-Commits: A Simple Git Commit Assistant**

In this article, we will explore `yum-commits`, a Rust program that assists users in generating commit messages for their Git repositories. The tool uses a large language model (LLM) to suggest commit messages based on the changes made in the repository.

**How it Works**

The `yum-commits` program consists of three main modules:

1.  **Git Operations**: This module handles all the interactions with the Git repository, such as checking if the target directory is a valid Git repository and getting the changes to be committed.
2.  **LLM Operations**: This module uses an LLM to generate suggested commit messages based on the changes made in the repository.
3.  **User Interaction**: This module handles all user input and interaction with the program, such as prompting for the target directory, changes type, nature of changes, and confirmation.

**Code Snippets**

### Git Operations

```rust
mod git_operations {
    use super::*;

    pub async fn is_git_repo(target: &Path) -> Result<bool, std::io::Error> {
        let output = run_git_command(&["rev-parse", "--is-inside-work-tree"], target)?;
        Ok(output.status.success())
    }

    pub async fn has_changes(target: &Path) -> Result<bool, std::io::Error> {
        let output = run_git_command(&["status", "--porcelain"], target)?;
        Ok(!output.stdout.is_empty())
    }

    pub async fn get_changes(target: &Path, changes_type: &str) -> Result<String, std::io::Error> {
        let diff_type = match changes_type {
            "staged" => "--cached",
            "unstaged" => "",
            _ => DEFAULT_DIFF_TYPE,
        };

        let output = run_git_command(&["diff", diff_type, ":(exclude)Cargo.lock"], target)?;

        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }

    pub fn commit_changes(target: &Path, message: &str) -> Result<(), Box<dyn Error>> {
        run_git_command(&["commit", "-m", message], target)?;
        Ok(())
    }

    pub fn push_changes(target: &Path) -> Result<(), Box<dyn Error>> {
        run_git_command(&["push"], target)?;
        Ok(())
    }
}
```

### LLM Operations

```rust
mod llm_operations {
    use super::*;

    pub async fn generate_commit_message_from_llm(
        changes: &str,
        nature_of_changes: &str
    ) -> Result<String, anyhow::Error> {
        let ollama = Ollama::new(LOCALHOST.to_string(), LLM_PORT);

        let prompt = format!(
            "{} \nCHANGES: {} \nNATURE OF CHANGES: {}",
            SYSTEM_PROMPT,
            changes,
            nature_of_changes
        );
        let options = GenerationOptions::default()
            .temperature(TEMPERATURE)
            .repeat_penalty(REPEAT_PENALTY)
            .top_k(TOP_K)
            .top_p(TOP_P);

        let res = ollama
            .generate(GenerationRequest::new(MODEL.to_string(), prompt).options(options)).await
            .unwrap();
        Ok(res.response)
    }
}
```

### User Interaction

```rust
mod user_interaction {
    use super::*;

    pub fn prompt_target_directory() -> String {
        let question = Question::input("target").message(TARGET_DIRECTORY).build();
        let answer = requestty::prompt_one(question).unwrap();
        answer.as_string().unwrap().to_string()
    }

    pub fn prompt_changes_type() -> String {
        let question = Question::select("changes_type")
            .message(CHANGES_TYPE_INQUERY)
            .choices(vec!["staged".to_string(), "unstaged".to_string()])
            .build();
        let answer = requestty::prompt_one(question).unwrap();
        answer.as_list_item().unwrap().text.clone()
    }

    pub fn prompt_nature_of_changes() -> String {
        let question = Question::input("changes_nature").message(CHANGES_NATURE_INQUERY).build();
        let answer = requestty::prompt_one(question).unwrap();
        answer.as_string().unwrap().to_string()
    }

    pub fn confirm_commit_message(commit_message: &str) -> bool {
        println!("\nGenerated Commit Message:\n{}", commit_message);
        let question = Question::confirm("approve")
            .message(APPROVE_COMMIT_INQUERY)
            .default(true)
            .build();
        requestty::prompt_one(question).unwrap().as_bool().unwrap()
    }

    pub fn confirm_push_changes() -> bool {
        let question = Question::confirm("push")
            .message(PUSH_CHANGES_INQUERY)
            .default(true)
            .build();
        requestty::prompt_one(question).unwrap().as_bool().unwrap()
    }
}
```

### Command Line Interface

To run the program, simply compile it and execute the resulting binary:

```bash
cargo run
```

The program will then prompt you for user input, such as the target directory and changes type. Based on your input, it will generate a commit message using an LLM and confirm with you that the generated message is correct.

**Conclusion**

`yum-commits` is a simple yet powerful tool for assisting users in generating commit messages for their Git repositories. By leveraging an LLM to suggest commit messages, it provides an additional layer of quality control and reduces the risk of human error.

The program's architecture consists of three main modules: Git Operations, LLM Operations, and User Interaction. Each module plays a crucial role in ensuring that the user experience is seamless and efficient.

We hope this guide has provided you with a thorough understanding of how to use `yum-commits` to streamline your commit process. Whether you're a seasoned developer or just starting out, we encourage you to give it a try!
