use pyo3::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use dashmap::DashMap;
use parking_lot::RwLock;
use lru::LruCache;
use std::num::NonZeroUsize;
use rayon::prelude::*;
use anyhow::{Result, Context};
use futures::future::join_all;
use tokio::sync::RwLock as TokioRwLock;
use std::time::{Duration, Instant};

/// High-performance concurrent cache with TTL
#[derive(Clone)]
pub struct FastCache<K, V> 
where
    K: std::hash::Hash + Eq + Clone,
    V: Clone,
{
    data: Arc<DashMap<K, CacheEntry<V>>>,
    max_size: usize,
    default_ttl: Duration,
}

#[derive(Clone)]
struct CacheEntry<V> {
    value: V,
    expires_at: Instant,
}

impl<K, V> FastCache<K, V>
where
    K: std::hash::Hash + Eq + Clone,
    V: Clone,
{
    pub fn new(max_size: usize, default_ttl: Duration) -> Self {
        Self {
            data: Arc::new(DashMap::new()),
            max_size,
            default_ttl,
        }
    }

    pub fn insert(&self, key: K, value: V) -> Option<V> {
        self.insert_with_ttl(key, value, self.default_ttl)
    }

    pub fn insert_with_ttl(&self, key: K, value: V, ttl: Duration) -> Option<V> {
        // Cleanup expired entries if cache is getting full
        if self.data.len() >= self.max_size {
            self.cleanup_expired();
        }

        let entry = CacheEntry {
            value: value.clone(),
            expires_at: Instant::now() + ttl,
        };

        self.data.insert(key, entry).map(|old| old.value)
    }

    pub fn get(&self, key: &K) -> Option<V> {
        self.data.get(key).and_then(|entry| {
            if entry.expires_at > Instant::now() {
                Some(entry.value.clone())
            } else {
                // Entry expired, remove it
                drop(entry);
                self.data.remove(key);
                None
            }
        })
    }

    pub fn remove(&self, key: &K) -> Option<V> {
        self.data.remove(key).map(|(_, entry)| entry.value)
    }

    pub fn cleanup_expired(&self) {
        let now = Instant::now();
        self.data.retain(|_, entry| entry.expires_at > now);
    }

    pub fn len(&self) -> usize {
        self.data.len()
    }

    pub fn is_empty(&self) -> bool {
        self.data.is_empty()
    }
}

/// High-performance string operations
pub struct StringUtils;

impl StringUtils {
    /// Parallel string processing for large datasets
    pub fn parallel_process_strings<F>(strings: Vec<String>, processor: F) -> Vec<String>
    where
        F: Fn(&str) -> String + Sync + Send,
    {
        strings
            .par_iter()
            .map(|s| processor(s))
            .collect()
    }

    /// Fast string similarity using edit distance
    pub fn similarity(s1: &str, s2: &str) -> f64 {
        let len1 = s1.chars().count();
        let len2 = s2.chars().count();
        
        if len1 == 0 && len2 == 0 {
            return 1.0;
        }
        
        let distance = edit_distance(s1, s2);
        let max_len = std::cmp::max(len1, len2);
        
        1.0 - (distance as f64 / max_len as f64)
    }

    /// Hash string for fast lookups
    pub fn fast_hash(s: &str) -> String {
        let hash = blake3::hash(s.as_bytes());
        use base64::{Engine as _, engine::general_purpose};
        general_purpose::STANDARD.encode(hash.as_bytes())
    }

    /// Extract keywords using simple regex
    pub fn extract_keywords(text: &str, min_length: usize) -> Vec<String> {
        let re = regex::Regex::new(r"\b[a-zA-Z]{2,}\b").unwrap();
        re.find_iter(text)
            .map(|m| m.as_str().to_lowercase())
            .filter(|word| word.len() >= min_length)
            .collect()
    }
}

fn edit_distance(s1: &str, s2: &str) -> usize {
    let s1_chars: Vec<_> = s1.chars().collect();
    let s2_chars: Vec<_> = s2.chars().collect();
    let len1 = s1_chars.len();
    let len2 = s2_chars.len();

    let mut matrix = vec![vec![0; len2 + 1]; len1 + 1];

    for i in 0..=len1 {
        matrix[i][0] = i;
    }
    for j in 0..=len2 {
        matrix[0][j] = j;
    }

    for i in 1..=len1 {
        for j in 1..=len2 {
            let cost = if s1_chars[i - 1] == s2_chars[j - 1] { 0 } else { 1 };
            matrix[i][j] = std::cmp::min(
                std::cmp::min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1),
                matrix[i - 1][j - 1] + cost,
            );
        }
    }

    matrix[len1][len2]
}

/// Fast concurrent HTTP client for web scraping
pub struct FastHttpClient {
    client: reqwest::Client,
    cache: FastCache<String, String>,
}

impl FastHttpClient {
    pub fn new() -> Self {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .expect("Failed to create HTTP client");

        Self {
            client,
            cache: FastCache::new(1000, Duration::from_secs(300)), // 5-minute cache
        }
    }

    pub async fn fetch_url(&self, url: &str) -> Result<String> {
        // Check cache first
        if let Some(cached) = self.cache.get(&url.to_string()) {
            return Ok(cached);
        }

        // Fetch from network
        let response = self.client
            .get(url)
            .send()
            .await
            .context("Failed to send request")?;

        let content = response
            .text()
            .await
            .context("Failed to read response text")?;

        // Cache the result
        self.cache.insert(url.to_string(), content.clone());
        
        Ok(content)
    }

    pub async fn fetch_multiple_urls(&self, urls: Vec<String>) -> Vec<Result<String>> {
        let tasks: Vec<_> = urls.into_iter().map(|url| {
            let client = self.client.clone();
            let cache = self.cache.clone();
            async move {
                // Check cache first
                if let Some(cached) = cache.get(&url) {
                    return Ok(cached);
                }

                // Fetch from network
                let response = client.get(&url).send().await?;
                let content = response.text().await?;

                // Cache the result
                cache.insert(url, content.clone());
                
                Ok(content)
            }
        }).collect();

        join_all(tasks).await
    }
}

/// Concurrent text processing utilities
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextProcessingResult {
    pub original_text: String,
    pub processed_text: String,
    pub keywords: Vec<String>,
    pub similarity_score: f64,
    pub processing_time_ms: u64,
}

pub struct TextProcessor {
    keyword_cache: FastCache<String, Vec<String>>,
}

impl TextProcessor {
    pub fn new() -> Self {
        Self {
            keyword_cache: FastCache::new(500, Duration::from_secs(600)), // 10-minute cache
        }
    }

    pub fn process_text_batch(&self, texts: Vec<String>, reference_text: Option<String>) -> Vec<TextProcessingResult> {
        texts
            .par_iter()
            .map(|text| {
                let start_time = Instant::now();
                
                // Extract keywords (with caching)
                let keywords = if let Some(cached) = self.keyword_cache.get(&text) {
                    cached
                } else {
                    let keywords = StringUtils::extract_keywords(text, 3);
                    self.keyword_cache.insert(text.clone(), keywords.clone());
                    keywords
                };

                // Calculate similarity if reference provided
                let similarity_score = if let Some(ref reference) = reference_text {
                    StringUtils::similarity(text, reference)
                } else {
                    0.0
                };

                // Simple text processing (lowercase, trim)
                let processed_text = text.trim().to_lowercase();
                
                let processing_time = start_time.elapsed().as_millis() as u64;

                TextProcessingResult {
                    original_text: text.clone(),
                    processed_text,
                    keywords,
                    similarity_score,
                    processing_time_ms: processing_time,
                }
            })
            .collect()
    }
}

/// Concurrent task queue for background processing
pub struct TaskQueue<T> {
    tasks: Arc<TokioRwLock<Vec<T>>>,
    max_workers: usize,
}

impl<T> TaskQueue<T>
where
    T: Send + Sync + 'static + Clone,
{
    pub fn new(max_workers: usize) -> Self {
        Self {
            tasks: Arc::new(TokioRwLock::new(Vec::new())),
            max_workers,
        }
    }

    pub async fn add_task(&self, task: T) {
        let mut tasks = self.tasks.write().await;
        tasks.push(task);
    }

    pub async fn process_tasks<F, Fut, R>(&self, processor: F) -> Vec<R>
    where
        F: Fn(T) -> Fut + Send + Sync + Clone + 'static,
        Fut: futures::Future<Output = R> + Send,
        R: Send + 'static,
    {
        let tasks: Vec<T> = {
            let mut task_list = self.tasks.write().await;
            std::mem::take(task_list.as_mut())
        };

        // Process tasks in chunks to control concurrency
        let chunk_size = (tasks.len() / self.max_workers).max(1);
        let mut results = Vec::new();

        for chunk in tasks.chunks(chunk_size) {
            let chunk_tasks: Vec<_> = chunk.iter().cloned().map(|task| {
                let processor = processor.clone();
                async move {
                    processor(task).await
                }
            }).collect();

            let chunk_results = join_all(chunk_tasks).await;
            results.extend(chunk_results);
        }

        results
    }

    pub async fn task_count(&self) -> usize {
        self.tasks.read().await.len()
    }
}

// Python bindings
#[pymodule]
fn agent_core_utils(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<PyFastCache>()?;
    m.add_class::<PyStringUtils>()?;
    m.add_class::<PyFastHttpClient>()?;
    m.add_class::<PyTextProcessor>()?;
    m.add_class::<PyTaskQueue>()?;
    Ok(())
}

#[pyclass]
struct PyFastCache {
    cache: FastCache<String, String>,
}

#[pymethods]
impl PyFastCache {
    #[new]
    fn new(max_size: Option<usize>, ttl_seconds: Option<u64>) -> Self {
        let max_size = max_size.unwrap_or(1000);
        let ttl = Duration::from_secs(ttl_seconds.unwrap_or(300));
        
        Self {
            cache: FastCache::new(max_size, ttl),
        }
    }

    fn insert(&self, key: String, value: String) -> Option<String> {
        self.cache.insert(key, value)
    }

    fn get(&self, key: String) -> Option<String> {
        self.cache.get(&key)
    }

    fn remove(&self, key: String) -> Option<String> {
        self.cache.remove(&key)
    }

    fn len(&self) -> usize {
        self.cache.len()
    }

    fn cleanup_expired(&self) {
        self.cache.cleanup_expired();
    }
}

#[pyclass]
struct PyStringUtils;

#[pymethods]
impl PyStringUtils {
    #[new]
    fn new() -> Self {
        Self
    }

    fn similarity(&self, s1: String, s2: String) -> f64 {
        StringUtils::similarity(&s1, &s2)
    }

    fn fast_hash(&self, s: String) -> String {
        StringUtils::fast_hash(&s)
    }

    fn extract_keywords(&self, text: String, min_length: Option<usize>) -> Vec<String> {
        StringUtils::extract_keywords(&text, min_length.unwrap_or(3))
    }

    fn parallel_process_strings(&self, strings: Vec<String>, operation: String) -> PyResult<Vec<String>> {
        let processor = match operation.as_str() {
            "lowercase" => |s: &str| s.to_lowercase(),
            "uppercase" => |s: &str| s.to_uppercase(),
            "trim" => |s: &str| s.trim().to_string(),
            "reverse" => |s: &str| s.chars().rev().collect(),
            _ => return Err(pyo3::exceptions::PyValueError::new_err("Unknown operation")),
        };

        Ok(StringUtils::parallel_process_strings(strings, processor))
    }
}

#[pyclass]
struct PyFastHttpClient {
    client: FastHttpClient,
    runtime: tokio::runtime::Runtime,
}

#[pymethods]
impl PyFastHttpClient {
    #[new]
    fn new() -> PyResult<Self> {
        let runtime = tokio::runtime::Runtime::new()
            .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("Failed to create async runtime: {}", e)))?;
        
        Ok(Self {
            client: FastHttpClient::new(),
            runtime,
        })
    }

    fn fetch_url(&self, url: String) -> PyResult<String> {
        let result = self.runtime.block_on(async {
            self.client.fetch_url(&url).await
        });

        match result {
            Ok(content) => Ok(content),
            Err(e) => Err(pyo3::exceptions::PyRuntimeError::new_err(format!("HTTP error: {}", e))),
        }
    }

    fn fetch_multiple_urls(&self, urls: Vec<String>) -> PyResult<Vec<String>> {
        let results = self.runtime.block_on(async {
            self.client.fetch_multiple_urls(urls).await
        });

        let mut success_results = Vec::new();
        for result in results {
            match result {
                Ok(content) => success_results.push(content),
                Err(e) => return Err(pyo3::exceptions::PyRuntimeError::new_err(format!("HTTP error: {}", e))),
            }
        }

        Ok(success_results)
    }
}

#[pyclass]
struct PyTextProcessor {
    processor: TextProcessor,
}

#[pymethods]
impl PyTextProcessor {
    #[new]
    fn new() -> Self {
        Self {
            processor: TextProcessor::new(),
        }
    }

    fn process_text_batch(&self, texts: Vec<String>, reference_text: Option<String>) -> PyResult<String> {
        let results = self.processor.process_text_batch(texts, reference_text);
        
        serde_json::to_string(&results)
            .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("Serialization error: {}", e)))
    }
}

#[pyclass]
struct PyTaskQueue {
    queue: TaskQueue<String>,
    runtime: tokio::runtime::Runtime,
}

#[pymethods]
impl PyTaskQueue {
    #[new]
    fn new(max_workers: Option<usize>) -> PyResult<Self> {
        let runtime = tokio::runtime::Runtime::new()
            .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("Failed to create async runtime: {}", e)))?;
        
        Ok(Self {
            queue: TaskQueue::new(max_workers.unwrap_or(4)),
            runtime,
        })
    }

    fn add_task(&self, task: String) -> PyResult<()> {
        self.runtime.block_on(async {
            self.queue.add_task(task).await;
        });
        Ok(())
    }

    fn task_count(&self) -> PyResult<usize> {
        Ok(self.runtime.block_on(async {
            self.queue.task_count().await
        }))
    }
}
