$('#communities').on('change', function() {
    let communityIdSelected = $('#communities option:selected').val();
    window.location.href = `/mycommunity/${communityIdSelected}`;
});