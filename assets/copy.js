(function () {
  function copyURI(e, copyLink) {
    e.preventDefault();

    const url = window.location.href;

    const handleCopy = (btn, success) => {
      if (success) {
        btn.classList.add("copied");
        setTimeout(() => {
          btn.classList.remove("copied");
        }, 1000);
      } else {
        btn.classList.add("notCopied");
        setTimeout(() => {
          btn.classList.remove("notCopied");
        }, 1000);
      }
    };

    navigator.clipboard.writeText(url).then(
      () => {
        handleCopy(copyLink, true);
      },
      () => {
        handleCopy(copyLink, false);
      }
    );
  }

  const copyLinks = document.querySelectorAll(".copy-btn");

  if (copyLinks.length) {
    for (const copyLink of copyLinks) {
      copyLink.addEventListener("click", (e) => copyURI(e, copyLink));
    }
  }
})();
