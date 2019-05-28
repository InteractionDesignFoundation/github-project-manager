<template>
    <section>
        <h2 class="title">Select a project to update</h2>
        <label
                for="projectSelector"
                class="label">Please select a milestone to close</label>
        <div class="select is-primary is-medium">
            <select
                    id="projectSelector"
                    v-model="selectedProject">
                <option
                        value=""
                        disabled>Please select a milestone
                </option>
                <option
                        v-for="project in projects"
                        :key="project.number"
                        :value="project">{{ project.name }} ({{ project.state }})
                </option>
            </select>
        </div>
    </section>
</template>

<script>
  export default {
    name: 'ProjectSelector',
    props: {
      octoGraphClient: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        projects: [],
        selectedProject: undefined,
      };
    },
    watch: {
      selectedProject: function (newMilestone) {
        this.$emit('project-selected', newMilestone);
      }
    },
    created: function () {
      this.loadProjects();
    },
    methods: {
      fetchProjects: function () {
        const query = `
query {
  organization(login: "InteractionDesignFoundation") {
    projects (first:10, states: OPEN) {
      nodes {
        number
        name
        state
      }
    }
  }
 }
`;
        return this.octoGraphClient
          .json({query: query})
          .post()
          .json(json => json.data.organization.projects.nodes)
      },
      loadProjects: function () {
        this.fetchProjects().then(projects => {
          this.projects = projects;
          this.$emit('projects-loaded');
          return projects;
        });
      }
    },
  }
</script>
