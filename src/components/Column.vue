<template>
    <div>
        {{ column.name }}
        <button v-if="isTodo()" @click="filloutByIssues">Fill out by Issues</button>
        <button v-if="isDone()" @click="cleanupCards">Cleanup</button>
    </div>
</template>

<script>
  export default {
    name: 'column',
    props: {
      column: {
        type: Object,
        required: true
      }
    },
    methods: {
      isTodo: function () {
        return this.column.purpose === 'TODO';
      },
      isInProgress: function () {
        return this.column.purpose === 'IN_PROGRESS';
      },
      isDone: function () {
        return this.column.purpose === 'DONE';
      },
      filloutByIssues: function () {
        console.log(this.column);
      },
      cleanupCards: function () {
        console.log(this.column);
      }
    }
  }
</script>