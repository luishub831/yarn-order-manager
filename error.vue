<template>
  <div class="error-container">
    <div class="error-content">
      <h1 class="error-title">{{ error.statusCode || 500 }}</h1>
      <p class="error-message">
        {{ error.statusMessage || 'Something went wrong' }}
      </p>
      
      <div class="error-details" v-if="isDev">
        <details>
          <summary>Error Details (Development)</summary>
          <pre>{{ error }}</pre>
        </details>
      </div>
      
      <div class="error-actions">
        <button @click="handleError" class="retry-button">
          Try Again
        </button>
        <NuxtLink to="/" class="home-button">
          Go Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object
})

const isDev = process.env.NODE_ENV === 'development'

const handleError = async () => {
  await clearError({ redirect: '/' })
}
</script>

<style scoped>
.error-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.error-content {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
}

.error-title {
  font-size: 4rem;
  font-weight: 700;
  color: #e74c3c;
  margin: 0 0 1rem 0;
}

.error-message {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin: 0 0 2rem 0;
}

.error-details {
  margin: 2rem 0;
  text-align: left;
}

.error-details summary {
  cursor: pointer;
  color: #3498db;
  margin-bottom: 1rem;
}

.error-details pre {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  overflow: auto;
  white-space: pre-wrap;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-button,
.home-button {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button {
  background: #3498db;
  color: white;
}

.retry-button:hover {
  background: #2980b9;
}

.home-button {
  background: #95a5a6;
  color: white;
  display: inline-block;
}

.home-button:hover {
  background: #7f8c8d;
}
</style>