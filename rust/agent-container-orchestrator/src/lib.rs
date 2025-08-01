use pyo3::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;
use anyhow::{Result, Context};
use bollard::{Docker, API_DEFAULT_VERSION};
use bollard::container::{
    Config, CreateContainerOptions, StartContainerOptions, StopContainerOptions,
    RemoveContainerOptions, ListContainersOptions
};
use bollard::image::{BuildImageOptions, CreateImageOptions};
use bollard::models::{ContainerSummary, BuildInfo};
use futures_util::stream::StreamExt;
use tokio::fs;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainerTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub dockerfile: String,
    pub docker_compose: Option<String>,
    pub environment_vars: HashMap<String, String>,
    pub ports: Vec<PortMapping>,
    pub volumes: Vec<VolumeMapping>,
    pub tools: Vec<String>,
    pub resource_limits: ResourceLimits,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortMapping {
    pub host_port: u16,
    pub container_port: u16,
    pub protocol: String, // "tcp" or "udp"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VolumeMapping {
    pub host_path: String,
    pub container_path: String,
    pub read_only: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceLimits {
    pub memory_mb: Option<u64>,
    pub cpu_shares: Option<u64>,
    pub swap_mb: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainerInfo {
    pub id: String,
    pub name: String,
    pub image: String,
    pub status: String,
    pub state: String,
    pub created: String,
    pub ports: Vec<String>,
    pub resource_usage: Option<ResourceUsage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceUsage {
    pub cpu_percent: f64,
    pub memory_mb: u64,
    pub memory_percent: f64,
    pub network_rx_bytes: u64,
    pub network_tx_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeploymentResult {
    pub success: bool,
    pub container_id: Option<String>,
    pub container_name: String,
    pub image_id: Option<String>,
    pub ports: Vec<String>,
    pub message: String,
    pub build_logs: Vec<String>,
    pub deployment_time_ms: u64,
}

pub struct FastContainerOrchestrator {
    docker: Docker,
    templates: Arc<RwLock<HashMap<String, ContainerTemplate>>>,
    deployments: Arc<RwLock<HashMap<String, ContainerInfo>>>,
}

impl FastContainerOrchestrator {
    pub async fn new() -> Result<Self> {
        let docker = Docker::connect_with_socket_defaults()
            .context("Failed to connect to Docker daemon")?;

        let mut orchestrator = Self {
            docker,
            templates: Arc::new(RwLock::new(HashMap::new())),
            deployments: Arc::new(RwLock::new(HashMap::new())),
        };

        // Load built-in templates
        orchestrator.load_builtin_templates().await?;

        Ok(orchestrator)
    }

    async fn load_builtin_templates(&self) -> Result<()> {
        let templates = vec![
            self.create_cybersec_lab_template(),
            self.create_dev_environment_template(),
            self.create_data_science_template(),
            self.create_ml_training_template(),
            self.create_web_pentest_template(),
        ];

        let mut template_map = self.templates.write().await;
        for template in templates {
            template_map.insert(template.id.clone(), template);
        }

        Ok(())
    }

    fn create_cybersec_lab_template(&self) -> ContainerTemplate {
        ContainerTemplate {
            id: "cybersec-lab".to_string(),
            name: "Cybersecurity Lab Environment".to_string(),
            description: "Complete cybersecurity testing environment with advanced tools".to_string(),
            dockerfile: r#"FROM kalilinux/kali-rolling:latest

# Update and install base tools
RUN apt-get update && apt-get install -y \
    nmap masscan zmap \
    metasploit-framework \
    wireshark tshark tcpdump \
    john hashcat \
    hydra medusa \
    sqlmap \
    nikto dirb gobuster \
    burpsuite-community \
    python3 python3-pip \
    git curl wget vim nano \
    && rm -rf /var/lib/apt/lists/*

# Install Python security tools
RUN pip3 install \
    scapy pwntools \
    requests beautifulsoup4 \
    impacket \
    volatility3

# Create workspace
WORKDIR /workspace
RUN mkdir -p /workspace/{scans,exploits,reports,tools}

# Setup non-root user
RUN useradd -m -s /bin/bash cybersec && \
    echo "cybersec:cybersec" | chpasswd && \
    usermod -aG sudo cybersec

USER cybersec
EXPOSE 8080 4444 8000
CMD ["/bin/bash"]"#.to_string(),
            docker_compose: None,
            environment_vars: [
                ("WORKSPACE".to_string(), "/workspace".to_string()),
                ("DISPLAY".to_string(), ":0".to_string()),
            ].into(),
            ports: vec![
                PortMapping { host_port: 8080, container_port: 8080, protocol: "tcp".to_string() },
                PortMapping { host_port: 4444, container_port: 4444, protocol: "tcp".to_string() },
                PortMapping { host_port: 8000, container_port: 8000, protocol: "tcp".to_string() },
            ],
            volumes: vec![
                VolumeMapping {
                    host_path: "./workspace".to_string(),
                    container_path: "/workspace".to_string(),
                    read_only: false,
                }
            ],
            tools: vec![
                "nmap".to_string(), "metasploit".to_string(), "wireshark".to_string(),
                "john".to_string(), "hashcat".to_string(), "burpsuite".to_string(),
            ],
            resource_limits: ResourceLimits {
                memory_mb: Some(4096),
                cpu_shares: Some(2048),
                swap_mb: Some(2048),
            },
        }
    }

    fn create_dev_environment_template(&self) -> ContainerTemplate {
        ContainerTemplate {
            id: "dev-environment".to_string(),
            name: "Full-Stack Development Environment".to_string(),
            description: "Complete development environment with multiple language support".to_string(),
            dockerfile: r#"FROM ubuntu:22.04

# Install base development tools
RUN apt-get update && apt-get install -y \
    curl wget git vim nano \
    build-essential \
    python3 python3-pip python3-venv \
    nodejs npm \
    openjdk-17-jdk \
    golang-go \
    rust-all \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js frameworks
RUN npm install -g \
    @angular/cli \
    create-react-app \
    @vue/cli \
    express-generator \
    typescript

# Install Python frameworks
RUN pip3 install \
    fastapi uvicorn \
    django flask \
    jupyter notebook \
    pandas numpy \
    pytest

# Install VS Code Server
RUN curl -fsSL https://code-server.dev/install.sh | sh

# Create development workspace
WORKDIR /workspace
RUN mkdir -p /workspace/{projects,data,config,logs}

# Setup development user
RUN useradd -m -s /bin/bash developer && \
    echo "developer:developer" | chpasswd && \
    usermod -aG sudo developer

USER developer
EXPOSE 3000 8000 5000 8080
CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "none"]"#.to_string(),
            docker_compose: None,
            environment_vars: [
                ("NODE_ENV".to_string(), "development".to_string()),
                ("PYTHONPATH".to_string(), "/workspace".to_string()),
            ].into(),
            ports: vec![
                PortMapping { host_port: 3000, container_port: 3000, protocol: "tcp".to_string() },
                PortMapping { host_port: 8000, container_port: 8000, protocol: "tcp".to_string() },
                PortMapping { host_port: 5000, container_port: 5000, protocol: "tcp".to_string() },
                PortMapping { host_port: 8080, container_port: 8080, protocol: "tcp".to_string() },
            ],
            volumes: vec![
                VolumeMapping {
                    host_path: "./workspace".to_string(),
                    container_path: "/workspace".to_string(),
                    read_only: false,
                }
            ],
            tools: vec![
                "nodejs".to_string(), "python3".to_string(), "git".to_string(),
                "vscode-server".to_string(), "docker".to_string(),
            ],
            resource_limits: ResourceLimits {
                memory_mb: Some(2048),
                cpu_shares: Some(1024),
                swap_mb: Some(1024),
            },
        }
    }

    fn create_data_science_template(&self) -> ContainerTemplate {
        ContainerTemplate {
            id: "data-science".to_string(),
            name: "Data Science Environment".to_string(),
            description: "Python data science and machine learning environment".to_string(),
            dockerfile: r#"FROM jupyter/scipy-notebook:latest

USER root

# Install additional ML libraries
RUN pip install \
    tensorflow \
    torch torchvision \
    scikit-learn \
    xgboost lightgbm \
    plotly dash \
    streamlit \
    mlflow \
    wandb \
    optuna

# Install system tools
RUN apt-get update && apt-get install -y \
    git curl wget vim \
    && rm -rf /var/lib/apt/lists/*

# Create workspace
WORKDIR /workspace
RUN mkdir -p /workspace/{notebooks,data,models,experiments,reports}

USER $NB_UID
EXPOSE 8888 8501 5000
CMD ["jupyter", "lab", "--ip=0.0.0.0", "--allow-root", "--no-browser"]"#.to_string(),
            docker_compose: None,
            environment_vars: [
                ("JUPYTER_ENABLE_LAB".to_string(), "yes".to_string()),
                ("JUPYTER_TOKEN".to_string(), "".to_string()),
            ].into(),
            ports: vec![
                PortMapping { host_port: 8888, container_port: 8888, protocol: "tcp".to_string() },
                PortMapping { host_port: 8501, container_port: 8501, protocol: "tcp".to_string() },
                PortMapping { host_port: 5000, container_port: 5000, protocol: "tcp".to_string() },
            ],
            volumes: vec![
                VolumeMapping {
                    host_path: "./workspace".to_string(),
                    container_path: "/workspace".to_string(),
                    read_only: false,
                }
            ],
            tools: vec![
                "jupyter".to_string(), "tensorflow".to_string(), "pytorch".to_string(),
                "scikit-learn".to_string(), "pandas".to_string(),
            ],
            resource_limits: ResourceLimits {
                memory_mb: Some(8192),
                cpu_shares: Some(2048),
                swap_mb: Some(4096),
            },
        }
    }

    fn create_ml_training_template(&self) -> ContainerTemplate {
        ContainerTemplate {
            id: "ml-training".to_string(),
            name: "ML Training Environment".to_string(),
            description: "High-performance ML training with GPU support".to_string(),
            dockerfile: r#"FROM nvidia/cuda:11.8-cudnn8-devel-ubuntu22.04

# Install Python and ML libraries
RUN apt-get update && apt-get install -y \
    python3 python3-pip \
    git curl wget \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install \
    torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118 \
    tensorflow[and-cuda] \
    transformers datasets \
    accelerate \
    wandb tensorboard \
    jupyter

# Create training workspace
WORKDIR /training
RUN mkdir -p /training/{datasets,models,experiments,logs,checkpoints}

EXPOSE 8888 6006
CMD ["jupyter", "lab", "--ip=0.0.0.0", "--allow-root", "--no-browser"]"#.to_string(),
            docker_compose: None,
            environment_vars: [
                ("CUDA_VISIBLE_DEVICES".to_string(), "0".to_string()),
                ("NVIDIA_VISIBLE_DEVICES".to_string(), "all".to_string()),
            ].into(),
            ports: vec![
                PortMapping { host_port: 8889, container_port: 8888, protocol: "tcp".to_string() },
                PortMapping { host_port: 6006, container_port: 6006, protocol: "tcp".to_string() },
            ],
            volumes: vec![
                VolumeMapping {
                    host_path: "./training".to_string(),
                    container_path: "/training".to_string(),
                    read_only: false,
                }
            ],
            tools: vec![
                "pytorch".to_string(), "tensorflow".to_string(), "transformers".to_string(),
                "cuda".to_string(), "tensorboard".to_string(),
            ],
            resource_limits: ResourceLimits {
                memory_mb: Some(16384),
                cpu_shares: Some(4096),
                swap_mb: Some(8192),
            },
        }
    }

    fn create_web_pentest_template(&self) -> ContainerTemplate {
        ContainerTemplate {
            id: "web-pentest".to_string(),
            name: "Web Application Penetration Testing".to_string(),
            description: "Specialized environment for web application security testing".to_string(),
            dockerfile: r#"FROM kalilinux/kali-rolling:latest

# Install web testing tools
RUN apt-get update && apt-get install -y \
    burpsuite-community \
    owasp-zap \
    sqlmap \
    nikto dirb gobuster \
    wfuzz ffuf \
    whatweb \
    python3 python3-pip \
    nodejs npm \
    && rm -rf /var/lib/apt/lists/*

# Install web testing Python tools
RUN pip3 install \
    requests beautifulsoup4 \
    selenium \
    scrapy \
    paramiko \
    pwntools

# Install web testing Node.js tools
RUN npm install -g \
    retire \
    jshint \
    eslint

# Create pentest workspace
WORKDIR /pentest
RUN mkdir -p /pentest/{targets,reports,payloads,scripts,evidence}

# Setup pentester user
RUN useradd -m -s /bin/bash pentester && \
    echo "pentester:pentester" | chpasswd && \
    usermod -aG sudo pentester

USER pentester
EXPOSE 8080 8081 9090
CMD ["/bin/bash"]"#.to_string(),
            docker_compose: None,
            environment_vars: [
                ("PENTEST_TARGET".to_string(), "".to_string()),
                ("DISPLAY".to_string(), ":0".to_string()),
            ].into(),
            ports: vec![
                PortMapping { host_port: 8080, container_port: 8080, protocol: "tcp".to_string() },
                PortMapping { host_port: 8081, container_port: 8081, protocol: "tcp".to_string() },
                PortMapping { host_port: 9090, container_port: 9090, protocol: "tcp".to_string() },
            ],
            volumes: vec![
                VolumeMapping {
                    host_path: "./pentest".to_string(),
                    container_path: "/pentest".to_string(),
                    read_only: false,
                }
            ],
            tools: vec![
                "burpsuite".to_string(), "owasp-zap".to_string(), "sqlmap".to_string(),
                "nikto".to_string(), "dirb".to_string(), "gobuster".to_string(),
            ],
            resource_limits: ResourceLimits {
                memory_mb: Some(3072),
                cpu_shares: Some(1536),
                swap_mb: Some(1536),
            },
        }
    }

    pub async fn deploy_template(&self, template_id: &str, container_name: Option<String>) -> Result<DeploymentResult> {
        let start_time = std::time::Instant::now();
        
        let template = {
            let templates = self.templates.read().await;
            templates.get(template_id)
                .ok_or_else(|| anyhow::anyhow!("Template '{}' not found", template_id))?
                .clone()
        };

        let deployment_name = container_name.unwrap_or_else(|| {
            format!("{}-{}", template_id, Uuid::new_v4().to_string()[..8].to_string())
        });

        // Build the image
        let image_tag = format!("agent-{}", template_id);
        let build_result = self.build_image(&template, &image_tag).await?;

        // Create and start the container
        let container_id = self.create_container(&template, &deployment_name, &image_tag).await?;
        self.start_container(&container_id).await?;

        // Get container info
        let container_info = self.get_container_info(&container_id).await?;

        // Store deployment info
        {
            let mut deployments = self.deployments.write().await;
            deployments.insert(deployment_name.clone(), container_info.clone());
        }

        let deployment_time = start_time.elapsed().as_millis() as u64;

        Ok(DeploymentResult {
            success: true,
            container_id: Some(container_id),
            container_name: deployment_name,
            image_id: Some(image_tag),
            ports: container_info.ports,
            message: "Container deployed successfully".to_string(),
            build_logs: build_result.logs,
            deployment_time_ms: deployment_time,
        })
    }

    async fn build_image(&self, template: &ContainerTemplate, image_tag: &str) -> Result<BuildResult> {
        let mut build_logs = Vec::new();

        // Create a temporary directory for the build context
        let build_dir = std::env::temp_dir().join(format!("agent-build-{}", Uuid::new_v4()));
        fs::create_dir_all(&build_dir).await?;

        // Write Dockerfile
        let dockerfile_path = build_dir.join("Dockerfile");
        fs::write(&dockerfile_path, &template.dockerfile).await?;

        // Create tar archive for build context
        let tar_path = build_dir.join("context.tar");
        let tar_file = std::fs::File::create(&tar_path)?;
        let mut tar_builder = tar::Builder::new(tar_file);

        // Add Dockerfile to tar
        tar_builder.append_file("Dockerfile", &mut std::fs::File::open(&dockerfile_path)?)?;
        tar_builder.finish()?;

        // Read tar file
        let tar_data = fs::read(&tar_path).await?;

        // Build the image
        let build_options = BuildImageOptions {
            dockerfile: "Dockerfile".to_string(),
            t: image_tag.to_string(),
            rm: true,
            forcerm: true,
            pull: true,
            ..Default::default()
        };

        let mut build_stream = self.docker.build_image(build_options, None, Some(tar_data.into()));

        while let Some(build_info) = build_stream.next().await {
            match build_info {
                Ok(info) => {
                    if let Some(stream) = info.stream {
                        build_logs.push(stream.trim().to_string());
                    }
                    if let Some(error) = info.error {
                        return Err(anyhow::anyhow!("Build error: {}", error));
                    }
                }
                Err(e) => return Err(anyhow::anyhow!("Build stream error: {}", e)),
            }
        }

        // Cleanup
        fs::remove_dir_all(&build_dir).await.ok();

        Ok(BuildResult { logs: build_logs })
    }

    async fn create_container(&self, template: &ContainerTemplate, name: &str, image: &str) -> Result<String> {
        // Configure port bindings
        let mut port_bindings = HashMap::new();
        for port in &template.ports {
            let container_port = format!("{}/{}", port.container_port, port.protocol);
            let host_config = vec![bollard::models::PortBinding {
                host_ip: Some("0.0.0.0".to_string()),
                host_port: Some(port.host_port.to_string()),
            }];
            port_bindings.insert(container_port, Some(host_config));
        }

        // Configure volume bindings
        let mut binds = Vec::new();
        for volume in &template.volumes {
            let bind = if volume.read_only {
                format!("{}:{}:ro", volume.host_path, volume.container_path)
            } else {
                format!("{}:{}", volume.host_path, volume.container_path)
            };
            binds.push(bind);
        }

        // Configure environment variables
        let env: Vec<String> = template.environment_vars.iter()
            .map(|(k, v)| format!("{}={}", k, v))
            .collect();

        let host_config = bollard::models::HostConfig {
            port_bindings: Some(port_bindings),
            binds: Some(binds),
            memory: template.resource_limits.memory_mb.map(|mb| (mb * 1024 * 1024) as i64),
            cpu_shares: template.resource_limits.cpu_shares.map(|shares| shares as i64),
            memory_swap: template.resource_limits.swap_mb.map(|mb| (mb * 1024 * 1024) as i64),
            ..Default::default()
        };

        let config = Config {
            image: Some(image.to_string()),
            env: Some(env),
            host_config: Some(host_config),
            ..Default::default()
        };

        let options = CreateContainerOptions {
            name: name.to_string(),
            platform: None,
        };

        let response = self.docker.create_container(Some(options), config).await?;
        Ok(response.id)
    }

    async fn start_container(&self, container_id: &str) -> Result<()> {
        self.docker.start_container(container_id, None::<StartContainerOptions<String>>).await?;
        Ok(())
    }

    async fn get_container_info(&self, container_id: &str) -> Result<ContainerInfo> {
        let container = self.docker.inspect_container(container_id, None).await?;
        
        let ports = if let Some(network_settings) = &container.network_settings {
            if let Some(port_bindings) = &network_settings.ports {
                port_bindings.iter()
                    .filter_map(|(container_port, host_ports)| {
                        host_ports.as_ref().and_then(|ports| {
                            ports.first().map(|port| {
                                format!("{}:{}", 
                                       port.host_ip.as_deref().unwrap_or("0.0.0.0"),
                                       port.host_port.as_deref().unwrap_or("?"))
                            })
                        })
                    })
                    .collect()
            } else {
                Vec::new()
            }
        } else {
            Vec::new()
        };

        Ok(ContainerInfo {
            id: container_id.to_string(),
            name: container.name.unwrap_or_default().trim_start_matches('/').to_string(),
            image: container.config.as_ref()
                .and_then(|c| c.image.clone())
                .unwrap_or_default(),
            status: container.state.as_ref()
                .and_then(|s| s.status.clone())
                .map(|s| s.to_string())
                .unwrap_or_default(),
            state: container.state.as_ref()
                .and_then(|s| s.status.clone())
                .map(|s| s.to_string())
                .unwrap_or_default(),
            created: container.created.unwrap_or_default(),
            ports,
            resource_usage: None, // Would need stats API call
        })
    }

    pub async fn list_templates(&self) -> Vec<ContainerTemplate> {
        let templates = self.templates.read().await;
        templates.values().cloned().collect()
    }

    pub async fn list_containers(&self) -> Result<Vec<ContainerInfo>> {
        let options = Some(ListContainersOptions::<String> {
            all: true,
            ..Default::default()
        });

        let containers = self.docker.list_containers(options).await?;
        
        let mut container_infos = Vec::new();
        for container in containers {
            let info = ContainerInfo {
                id: container.id.unwrap_or_default(),
                name: container.names.unwrap_or_default().first().unwrap_or(&"unknown".to_string()).trim_start_matches('/').to_string(),
                image: container.image.unwrap_or_default(),
                status: container.status.unwrap_or_default(),
                state: container.state.unwrap_or_default(),
                created: container.created.map(|c| c.to_string()).unwrap_or_default(),
                ports: container.ports.unwrap_or_default().iter()
                    .map(|p| format!("{}:{}", p.public_port.unwrap_or(0), p.private_port))
                    .collect(),
                resource_usage: None,
            };
            container_infos.push(info);
        }

        Ok(container_infos)
    }

    pub async fn stop_container(&self, container_name: &str) -> Result<()> {
        let options = Some(StopContainerOptions { t: 10 });
        self.docker.stop_container(container_name, options).await?;
        Ok(())
    }

    pub async fn remove_container(&self, container_name: &str, force: bool) -> Result<()> {
        let options = Some(RemoveContainerOptions {
            force,
            v: true, // Remove volumes
            ..Default::default()
        });
        self.docker.remove_container(container_name, options).await?;
        
        // Remove from deployments
        let mut deployments = self.deployments.write().await;
        deployments.remove(container_name);
        
        Ok(())
    }
}

#[derive(Debug)]
struct BuildResult {
    logs: Vec<String>,
}

// Python bindings
#[pymodule]
fn agent_container_orchestrator(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<PyContainerOrchestrator>()?;
    Ok(())
}

#[pyclass]
struct PyContainerOrchestrator {
    orchestrator: Arc<FastContainerOrchestrator>,
    runtime: tokio::runtime::Runtime,
}

#[pymethods]
impl PyContainerOrchestrator {
    #[new]
    fn new() -> PyResult<Self> {
        let runtime = tokio::runtime::Runtime::new()
            .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("Failed to create async runtime: {}", e)))?;

        let orchestrator = runtime.block_on(async {
            FastContainerOrchestrator::new().await
        }).map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("Failed to initialize orchestrator: {}", e)))?;

        Ok(Self {
            orchestrator: Arc::new(orchestrator),
            runtime,
        })
    }

    fn deploy_template(&self, template_id: String, container_name: Option<String>) -> PyResult<String> {
        let orchestrator = self.orchestrator.clone();
        let result = self.runtime.block_on(async move {
            orchestrator.deploy_template(&template_id, container_name).await
        });

        match result {
            Ok(deployment) => serde_json::to_string(&deployment)
                .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("Serialization error: {}", e))),
            Err(e) => Err(pyo3::exceptions::PyRuntimeError::new_err(format!("Deployment error: {}", e))),
        }
    }

    fn list_templates(&self) -> PyResult<String> {
        let orchestrator = self.orchestrator.clone();
        let templates = self.runtime.block_on(async move {
            orchestrator.list_templates().await
        });

        serde_json::to_string(&templates)
            .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("Serialization error: {}", e)))
    }

    fn list_containers(&self) -> PyResult<String> {
        let orchestrator = self.orchestrator.clone();
        let result = self.runtime.block_on(async move {
            orchestrator.list_containers().await
        });

        match result {
            Ok(containers) => serde_json::to_string(&containers)
                .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("Serialization error: {}", e))),
            Err(e) => Err(pyo3::exceptions::PyRuntimeError::new_err(format!("List containers error: {}", e))),
        }
    }

    fn stop_container(&self, container_name: String) -> PyResult<String> {
        let orchestrator = self.orchestrator.clone();
        let container_name_clone = container_name.clone();
        let result = self.runtime.block_on(async move {
            orchestrator.stop_container(&container_name_clone).await
        });

        match result {
            Ok(_) => Ok(format!(r#"{{"success": true, "message": "Container {} stopped"}}"#, container_name)),
            Err(e) => Err(pyo3::exceptions::PyRuntimeError::new_err(format!("Stop container error: {}", e))),
        }
    }

    fn remove_container(&self, container_name: String, force: Option<bool>) -> PyResult<String> {
        let orchestrator = self.orchestrator.clone();
        let force = force.unwrap_or(false);
        let container_name_clone = container_name.clone();
        let container_name_for_response = container_name.clone();
        let result = self.runtime.block_on(async move {
            orchestrator.remove_container(&container_name_clone, force).await
        });

        match result {
            Ok(_) => Ok(format!(r#"{{"success": true, "message": "Container {} removed"}}"#, container_name_for_response)),
            Err(e) => Err(pyo3::exceptions::PyRuntimeError::new_err(format!("Remove container error: {}", e))),
        }
    }
}
