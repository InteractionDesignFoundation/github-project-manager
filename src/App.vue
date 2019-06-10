<template>
    <main id="app">
        <notifications group="app" position="bottom right" width="400"/>

        <section class="hero">
            <img
                    class="hero__image"
                    alt="Shipper logo"
                    src="./assets/logo.png">
        </section>

        <Settings @settings-set="onSettingsSet" class="step"/>

        <ProjectSelector
                class="step"
                :octo-graph-client="octoGraphClient"
                v-if="octoGraphClient"
                @project-selected="onProjectSelected"
        />

        <ProjectStatistics
                class="step"
                :octo-graph-client="octoGraphClient"
                :selected-project-id="selectedProject.number"
                v-if="selectedProject"
        />
    </main>
</template>

<script>
  import wretch from 'wretch'
  import Settings from './components/Settings.vue'
  import ProjectSelector from './components/ProjectSelector.vue'
  import ProjectStatistics from './components/ProjectStatistics.vue'

  import Vue from 'vue'

  import Notifications from 'vue-notification'
  Vue.use(Notifications);

  export default {
    name: 'app',
    components: {
      Settings: Settings,
      ProjectSelector: ProjectSelector,
      ProjectStatistics: ProjectStatistics
    },
    data() {
      return {
        octoGraphClient: undefined,
        selectedProject: false
      }
    },
    methods: {
      onSettingsSet: function (settings) {
        this.octoGraphClient = wretch()
          .url('https://api.github.com/graphql')
          .errorType('json')
          .auth(`Bearer ${settings.githubAccessToken}`)
          .options({mode: 'cors'});
      },
      onProjectSelected: function (project) {
        this.selectedProject = project;
      }
    }
  }
</script>

<style>
    :root {
        --blue: rgba(21, 102, 255, 0.67);
        --white: rgb(255, 255, 255);
        --gray: rgb(249, 249, 249);
        --spacing-sm: 10px;
        --spacing-md: 20px;
        --spacing-lg: 50px;
    }

    html {
        padding: 0;
        margin: 0;
        background-color: var(--gray);
    }

    #app {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    main {
        max-width: 900px;
        margin: 0 auto;
    }

    .step {
        margin-bottom: var(--spacing-lg);
        background-color: var(--white);
        padding: var(--spacing-md);
    }
</style>

<style scoped>
    .hero {
        margin: var(--spacing-md) 0;
        text-align: center;
    }
    .hero__image {
        max-height: 100px;
        object-fit: contain;
    }
</style>
